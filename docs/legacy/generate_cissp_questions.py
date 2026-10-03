import json

questions = []

# Question 1
questions.append({
    "id": "cissp-001",
    "type": "single-choice",
    "topicId": "security-governance",
    "difficulty": "medium",
    "points": 1,
    "scenarioText": "A financial institution is establishing a new information security program. The Chief Information Security Officer (CISO) wants to ensure the program aligns with international standards and provides a systematic framework for managing information security.",
    "questionText": "Which framework should the organization implement to establish a comprehensive information security management system based on international standards?",
    "options": [
        {"id": "A", "text": "COBIT", "isCorrect": False},
        {"id": "B", "text": "ISO/IEC 27001", "isCorrect": True},
        {"id": "C", "text": "NIST Cybersecurity Framework", "isCorrect": False},
        {"id": "D", "text": "PCI DSS", "isCorrect": False}
    ],
    "explanation": {
        "correct": "ISO/IEC 27001 is the international standard for information security management systems (ISMS). It provides a systematic framework for managing sensitive company information.",
        "incorrect": "Incorrect. While COBIT and NIST CSF are valuable frameworks, ISO/IEC 27001 is the specific international standard for ISMS certification.",
        "examTip": "Remember that ISO/IEC 27001 is the only certifiable standard among the major frameworks. NIST CSF is voluntary guidance, while ISO 27001 provides audit criteria.",
        "relatedTopics": ["security-governance", "risk-management", "iso-27001"]
    },
    "metadata": {
        "examObjective": "Develop organizational security policies, standards, and procedures",
        "references": ["https://www.isc2.org/certifications/cissp"],
        "lastUpdated": "2024-01-15"
    }
})

# Continue adding all 100 questions...

with open("c:\\Users\\frede\\Desktop\\Projects\\ExamPrep\\content\\certifications\\isc2\\cissp\\questions.json", "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2)
    print(f"Generated {len(questions)} questions")
