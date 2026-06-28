const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Report = require('../models/Report');

exports.handleChat = async (req, res) => {
  const { message, userId, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    // 1. Retrieve additional context from DB if userId is provided
    let userContext = "";
    let userReports = [];
    let patientPhone = "";
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      if (user) {
        patientPhone = user.phone;
        userContext = `Patient profile: Name: ${user.name}, Email: ${user.email}, Phone: ${user.phone}.`;
        userReports = await Report.find({ patientPhone: user.phone }).sort({ date: -1 });
      }
    }

    // 2. Fetch doctors list
    const doctors = await Doctor.find({});
    const doctorsContext = doctors.map(d => 
      `- ${d.name} (${d.dept}) at ${d.hospital}. Experience: ${d.experience}. Bio: ${d.bio}. Available Slots: ${d.slots.join(', ')}`
    ).join('\n');

    // 3. Format patient reports context
    let reportsContext = "No health reports found in the system. Advise the patient to consult a nurse or doctor.";
    if (userReports.length > 0) {
      reportsContext = userReports.map((r, idx) => 
        `Report #${idx + 1} (${new Date(r.date).toLocaleDateString()}):
- Overall Health Score: ${r.healthScore}%
- Diagnosis & Notes: ${r.reportDescription}
- Automated suggestions: ${r.healthScore < 50 ? 'Critical condition' : 'Normal follow-ups'}`
      ).join('\n\n');
    }

    // Check if Gemini API Key is available
    if (process.env.GEMINI_API_KEY) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemInstruction = `You are the friendly, helpful and professional MediCare+ Virtual Assistant.
You represent MediCare+, a world-class multi-specialty hospital network.
Here is the general information about Medicare+:
- Available cities & departments:
  * Bangalore: Cardiology, Neurology, Orthopedics
  * Hyderabad: Neurology, Gynecology, Cardiology
  * Kadapa: Cardiology, Neurology, Gynecology
  * Tirupati: Cardiology, Pulmonology, Dermatology
  * Kurnool: Orthopedics, Cardiology, Neurology
  * Ananthapur: Neurology, Cardiology, Orthopedics
  * Pune: Orthopedics, Cardiology
  * Ahmedabad: Cardiology, Neurology
- Specialized Services: Emergency Care, Critical Care (ICU), Advanced Diagnostics, 24/7 Pharmacy.
- Emergency Helpline: +91 9391361665
- Email Support: support@medicareplus.com

Current Patient Context:
${userContext || 'The user is currently a Guest/Not Logged In. Ask them to login or register to book appointments or see their health reports.'}

Patient Medical Reports in Database:
${reportsContext}

Available Doctors and their Slots:
${doctorsContext}

RULES & INSTRUCTIONS:
1. Answer any general questions about Medicare+ services, emergency numbers, facilities, locations, and doctors.
2. If the user asks about their health, checkups, or reports:
   - Provide a helpful, clear summary of their recent medical reports and health scores if logged in.
   - Advise them on automated health suggestions based on their diagnostics (e.g. diet, exercise, consulting specialists).
   - ALWAYS include a professional disclaimer: "Please note this is an AI summary. Consult a doctor for diagnostic confirmation."
   - If not logged in, ask them to log in to see reports.
3. If the user wants to book an appointment:
   - If they are NOT logged in, politely tell them they need to login or register first, and provide guidance on how to do so.
   - If logged in, you MUST guide them or collect 5 inputs:
     1. City (Must match one of the cities above)
     2. Specialty (Department matching that city)
     3. Doctor Name (Must be an active doctor matching the city and specialty from the doctors list)
     4. Date (A valid date, e.g., YYYY-MM-DD)
     5. Time Slot (Must match one of the available slots for that doctor)
   - When you have COLLECTED ALL 5 elements, you MUST return a valid JSON object as your response. Do NOT wrap it in markdown block quotes (like \`\`\`json) if possible, but if you do, ensure it has this exact format:
   {
     "response": "Congratulations, I have successfully scheduled your appointment with [Doctor Name] in [City] ([Specialty]) on [Date] at [Time Slot].",
     "action": "book_appointment",
     "appointmentDetails": {
       "city": "[City]",
       "dept": "[Specialty]",
       "doctorName": "[Doctor Name]",
       "date": "[Date]",
       "slot": "[Time Slot]"
     }
   }
   - If ANY details are missing, do NOT output the JSON block yet. Politely ask the patient for the missing details (e.g. which city, which doctor, which date, or which slot). Ask for them one or two at a time to make it conversational. Suggest options based on the doctors list context.
4. Keep your tone compassionate, reassuring, and professional.`;

      const chatPrompts = [];
      chatPrompts.push({ role: 'user', parts: [{ text: systemInstruction }] });
      chatPrompts.push({ role: 'model', parts: [{ text: "Understood. I am ready to assist Medicare+ patients." }] });

      if (chatHistory && Array.isArray(chatHistory)) {
        chatHistory.forEach(h => {
          chatPrompts.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: typeof h.text === 'object' ? JSON.stringify(h.text) : h.text }]
          });
        });
      }

      chatPrompts.push({ role: 'user', parts: [{ text: message }] });

      const result = await model.generateContent({
        contents: chatPrompts
      });
      const responseText = result.response.text();

      let parsed = null;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Ignore
      }

      if (parsed && parsed.action === 'book_appointment') {
        return res.json(parsed);
      } else {
        return res.json({ response: responseText });
      }
    } else {
      // 4. FALLBACK RULE-BASED / SMART CONVERSATIONAL FLOW
      const lowerMessage = message.toLowerCase().trim();

      // Check booking first to prevent general keywords matching in booking payload values (e.g. "dept:")
      if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('city:') || lowerMessage.includes('dept:') || lowerMessage.includes('doc:') || lowerMessage.includes('date:') || lowerMessage.includes('slot:')) {
        if (!userId) {
          return res.json({
            response: `🔐 Please log in to your account first before booking an appointment. Click "Login" in the navigation bar.`
          });
        }

        const getVal = (prefix) => {
          const match = message.match(new RegExp(prefix + ':([^|]+)'));
          return match ? match[1].trim() : null;
        };

        const citySel = getVal('city');
        const deptSel = getVal('dept');
        const docSel = getVal('doc');
        const dateSel = getVal('date');
        const slotSel = getVal('slot');

        if (!citySel && !deptSel && !docSel && !dateSel && !slotSel) {
          const cities = ["Kadapa", "Hyderabad", "Bangalore", "Tirupati", "Kurnool", "Ananthapur", "Pune", "Ahmedabad"];
          return res.json({
            response: `Let's book an appointment! Please select a City to find our hospitals:`,
            options: cities.map(c => ({ label: c, value: `city:${c}` }))
          });
        }

        if (citySel && !deptSel) {
          const hospitalDepts = {
            Bangalore: ["Cardiology", "Neurology", "Orthopedics"],
            Hyderabad: ["Neurology", "Gynecology", "Cardiology"],
            Kadapa: ["Cardiology", "Neurology", "Gynecology"],
            Tirupati: ["Cardiology", "Pulmonology", "Dermatology"],
            Kurnool: ["Orthopedics", "Cardiology", "Neurology"],
            Ananthapur: ["Neurology", "Cardiology", "Orthopedics"],
            Pune: ["Orthopedics", "Cardiology"],
            Ahmedabad: ["Cardiology", "Neurology"]
          };
          const depts = hospitalDepts[citySel] || [];
          return res.json({
            response: `Great! You selected **${citySel}**. Please select a specialty department:`,
            options: depts.map(d => ({ label: d, value: `city:${citySel} | dept:${d}` }))
          });
        }

        if (citySel && deptSel && !docSel) {
          const filteredDocs = doctors.filter(d => d.hospital.toLowerCase() === citySel.toLowerCase() && d.dept.toLowerCase() === deptSel.toLowerCase());
          if (filteredDocs.length === 0) {
            return res.json({
              response: `I'm sorry, we don't have any doctors available in **${citySel}** under **${deptSel}** right now. Please select another specialty:`,
              options: ["Cardiology", "Neurology", "Orthopedics"].map(d => ({ label: d, value: `city:${citySel} | dept:${d}` }))
            });
          }
          return res.json({
            response: `You selected **${deptSel}** in **${citySel}**. Please select a doctor:`,
            options: filteredDocs.map(d => ({ label: `${d.name} (${d.experience})`, value: `city:${citySel} | dept:${deptSel} | doc:${d.name}` }))
          });
        }

        if (citySel && deptSel && docSel && !dateSel) {
          return res.json({
            response: `You selected **${docSel}**. Please select or enter a date for your appointment (YYYY-MM-DD):`,
            inputRequired: 'date',
            valuePrefix: `city:${citySel} | dept:${deptSel} | doc:${docSel}`
          });
        }

        if (citySel && deptSel && docSel && dateSel && !slotSel) {
          const selectedDoc = doctors.find(d => d.name.toLowerCase() === docSel.toLowerCase());
          const slots = selectedDoc ? selectedDoc.slots : ["Morning-10:00AM", "Evening-4:00PM"];
          return res.json({
            response: `You selected date **${dateSel}**. Please select an available time slot:`,
            options: slots.map(s => ({ label: s, value: `city:${citySel} | dept:${deptSel} | doc:${docSel} | date:${dateSel} | slot:${s}` }))
          });
        }

        if (citySel && deptSel && docSel && dateSel && slotSel) {
          return res.json({
            response: `All details collected! Confirming appointment with ${docSel} on ${dateSel} at ${slotSel}...`,
            action: "book_appointment",
            appointmentDetails: {
              city: citySel,
              dept: deptSel,
              doctorName: docSel,
              date: dateSel,
              slot: slotSel
            }
          });
        }
      }

      if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage === 'hi' || lowerMessage.includes('hey')) {
        return res.json({
          response: `Hello! I am the MediCare+ Virtual Assistant. 🤖 How can I help you today?
- 📅 Book an Appointment
- 🩺 Check My Health Status
- 🚑 Emergency Contact
- 🔬 Hospital Services`
        });
      }

      if (lowerMessage.includes('emergency') || lowerMessage.includes('ambulance') || lowerMessage.includes('helpline') || lowerMessage.includes('phone') || lowerMessage.includes('contact')) {
        return res.json({
          response: `🚨 **MediCare+ Emergency Support** is available 24/7!
- 📞 **Helpline:** [+91 9391361665](tel:+919391361665)
- 📧 **Email:** support@medicareplus.com
- 📍 **Location:** City Center, India`
        });
      }

      if (lowerMessage.includes('service') || lowerMessage.includes('special') || lowerMessage.includes('dept') || lowerMessage.includes('specialties')) {
        return res.json({
          response: `🔬 **Our Specialized Services:**
1. **Emergency Care:** 24/7 emergency & trauma response.
2. **Critical Care (ICU):** Managed by senior intensivists.
3. **Advanced Diagnostics:** High-resolution MRI, CT, and labs.
4. **24/7 Pharmacy:** Fully stocked in-house pharmacy.

We offer specialties like Cardiology, Neurology, Orthopedics, Pulmonology, Gynecology, and Dermatology across our 8 major cities (Bangalore, Hyderabad, Kadapa, Tirupati, Kurnool, Ananthapur, Pune, Ahmedabad).`
        });
      }

      if (lowerMessage.includes('health') || lowerMessage.includes('report') || lowerMessage.includes('score') || lowerMessage.includes('diagnostic')) {
        if (!userId) {
          return res.json({
            response: `🔐 Please log in as a Patient to check your health reports and health score. You can do so by clicking "Login" in the navigation bar.`
          });
        }

        if (userReports.length === 0) {
          return res.json({
            response: `🩺 I searched our records but couldn't find any medical reports associated with your phone number (${patientPhone}). Please ask the attending nurse to upload your test results.`
          });
        }

        const latestReport = userReports[0];
        const dateStr = new Date(latestReport.date).toLocaleDateString();
        
        let scoreText = `**Overall Health Score:** ${latestReport.healthScore}%\n`;
        
        return res.json({
          response: `🩺 **Your Latest Health Report Summary (Date: ${dateStr})**
${scoreText}
**Diagnosis & Notes:**
${latestReport.reportDescription}

**Automated Health Suggestions:**
${latestReport.healthScore < 75 ? '• Monitor sodium/sugar intake.\n• Plan 30 minutes of daily exercise.\n• Consult your specialist.' : '• Maintain a healthy balanced diet.\n• Stay hydrated and exercise regularly.'}

*Disclaimer: This is an AI summary of your electronic record. Consult your doctor for therapeutic decisions.*`
        });
      }

      return res.json({
        response: `I'm not sure how to answer that. How can I help you?
- 📅 Book an Appointment
- 🩺 Check My Health Status
- 🚑 Emergency Helpline
- 🔬 General Services Info`
      });
    }

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Internal server error in chatbot backend' });
  }
};
