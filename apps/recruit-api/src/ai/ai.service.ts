import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { GeminiService } from '@orvexa/ai';

export interface ParsedResumeResult {
  summary: string;
  skills: string[];
  matchScore: number;
  fitExplanation: string;
  suggestedQuestions: string[];
}

@Injectable()
export class AiService implements OnModuleInit {
  private geminiService!: GeminiService;

  onModuleInit() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('WARN: GEMINI_API_KEY is not defined in environment variables. AI features will run in mock fallback mode.');
      return;
    }
    this.geminiService = new GeminiService(apiKey, 'gemini-flash-latest');
  }

  async parseResume(
    fileBuffer: Buffer,
    mimeType: string,
    jobDescription: string,
    tenantId: string
  ): Promise<ParsedResumeResult> {
    // If no API key is loaded, return a clean mock response so local builds never break
    if (!this.geminiService) {
      return {
        summary: 'Candidate experienced in building and maintaining web applications.',
        skills: ['JavaScript', 'React', 'Node.js'],
        matchScore: 80,
        fitExplanation: 'Fallback Mock Mode: Matching skills detected. Gemini API key is missing.',
        suggestedQuestions: [
          'Can you describe your experience with React?',
          'How do you manage API integrations on the backend?'
        ]
      };
    }

    const systemPrompt = `You are an expert AI recruitment parser. Analyze the candidate's resume (attached as a PDF/Word file) and compare it against the job description provided below.

JOB DESCRIPTION:
"""
${jobDescription}
"""

You MUST extract and return candidate details in a strict JSON format matching this schema:
{
  "summary": "Brief professional summary of the candidate's background (1-2 sentences)",
  "skills": ["extracted_skill_1", "extracted_skill_2", ...],
  "matchScore": 85, // Integer score from 0 to 100 indicating fit for this job
  "fitExplanation": "Description of strengths and gaps relative to the job description",
  "suggestedQuestions": ["tailored_interview_question_1", "tailored_interview_question_2", ...] // 3-4 custom questions addressing experience gaps or resume details
}

Do NOT wrap the response in markdown blocks like \`\`\`json. Return ONLY the raw JSON string.`;

    const filePart = {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
          : 'application/pdf'
      }
    };

    try {
      const response = await this.geminiService.generateContent({
        tenantId,
        prompt: [systemPrompt, filePart],
        promptVersion: 'resume_parser_v1',
        temperature: 0.15,
      });

      // Sanitize output (stripping potential markdown markers from LLM output)
      const cleanJson = response.text
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const parsed: ParsedResumeResult = JSON.parse(cleanJson);
      return parsed;

    } catch (err: any) {
      console.error('Failed to parse resume with Gemini:', err.message || err);
      // Fail gracefully with a default structured object rather than breaking the application flow
      return {
        summary: 'Error processing resume file structure.',
        skills: [],
        matchScore: 50,
        fitExplanation: 'Fallback Mode: An error occurred during Gemini AI parsing operations.',
        suggestedQuestions: ['Could you walk us through your work history?']
      };
    }
  }

  async generateDescription(outline: string, tenantId: string): Promise<string> {
    if (!this.geminiService) {
      return `### Role Overview\nThis is a mock job description generated from the outline: "${outline}".\n\n### Key Responsibilities\n- Implement scalable technical modules matching the requirements.\n- Collaborate with team members to deliver business goals.\n\n### Technical Requirements\n- Strong experience aligned with outline highlights: "${outline}".`;
    }

    const systemPrompt = `You are a world-class executive recruiter. Expand the user's outline/prompt into a professional, structured, and detailed job description.

OUTLINE HIGHLIGHTS:
"""
${outline}
"""

The generated description MUST contain these exact sections in Markdown format:
### Role Overview
[detailed description paragraph]

### Key Responsibilities
- [bullet point 1]
- [bullet point 2]
...

### Technical Requirements
- [bullet point 1]
- [bullet point 2]
...

Return ONLY the markdown job description. Do NOT include any intro greetings, concluding remarks, or markdown code block markers.`;

    try {
      const response = await this.geminiService.generateContent({
        tenantId,
        prompt: systemPrompt,
        promptVersion: 'job_desc_expansion_v1',
        temperature: 0.6,
      });

      return response.text
        .replace(/^```markdown\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/i, '')
        .trim();
    } catch (err: any) {
      console.error('Gemini description generation failed:', err.message || err);
      return `### Role Overview\nDescription expansion failed: ${err.message || err}\n\n### Highlights\n- Outline: ${outline}`;
    }
  }

  async generateInterviewQuestions(
    summary: string,
    skills: string[],
    jobDescription: string,
    focusTopic: string | undefined,
    tenantId: string
  ): Promise<string[]> {
    if (!this.geminiService) {
      return [
        `Mock Question 1: How does your experience in ${skills.slice(0, 2).join(', ') || 'software development'} relate to this role?`,
        `Mock Question 2: Can you elaborate on your skills regarding ${focusTopic || 'system design'}?`,
        `Mock Question 3: How do you handle code reviews and testing in a team environment?`
      ];
    }

    const focusPrompt = focusTopic 
      ? `Ensure you prioritize generating questions that specifically target the candidate's knowledge of: "${focusTopic}".`
      : 'Generate custom questions focusing on gaps between the candidate\'s skills/summary and the job description.';

    const systemPrompt = `You are an elite AI technical interviewer. Generate a list of exactly 4 interview questions tailored to the candidate's profile and the job description.

CANDIDATE SUMMARY:
${summary}

CANDIDATE SKILLS:
${skills.join(', ')}

JOB DESCRIPTION:
${jobDescription}

FOCUS TOPIC:
${focusPrompt}

You MUST return the questions in a strict JSON string array format:
["question_1", "question_2", "question_3", "question_4"]

Do NOT wrap the response in markdown blocks like \`\`\`json. Return ONLY the raw JSON array string.`;

    try {
      const response = await this.geminiService.generateContent({
        tenantId,
        prompt: systemPrompt,
        promptVersion: 'interview_questions_v1',
        temperature: 0.3,
      });

      const cleanJson = response.text
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const parsed: string[] = JSON.parse(cleanJson);
      return parsed;
    } catch (err: any) {
      console.error('Gemini questions generation failed:', err.message || err);
      return [
        `Could you walk us through your experience related to ${focusTopic || 'this role'}?`
      ];
    }
  }
}

