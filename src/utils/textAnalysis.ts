import CryptoJS from 'crypto-js';

interface AnalysisResult {
  summary: string;
  inspiration: string;
}

const API_URL = 'wss://spark-api.xf-yun.com/v1.1/chat';
const APP_ID = '011ecb82';
const API_KEY = '237ca5d822b862f5d0561b4ce6463bfc';
const API_SECRET = 'Mzk1NTIyNmYyZmZiOWY1ZWM0M2FmYzY2';

function getWebsocketUrl(): string {
  const url = API_URL;
  const host = 'spark-api.xf-yun.com';
  const date = new Date().toUTCString();
  const algorithm = 'hmac-sha256';
  const headers = 'host date request-line';
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`;
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, API_SECRET);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);
  const authorizationOrigin = `api_key="${API_KEY}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
  const authorization = btoa(authorizationOrigin);

  return `${url}?authorization=${authorization}&date=${date}&host=${host}`;
}

export async function analyzeText(text: string): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(getWebsocketUrl());

    socket.onopen = () => {
      const prompt = `Analyze the following text and provide two parts:

1. Summary: Give a very concise summary of the main points in 2-3 sentences. Focus only on the key information without adding any extra details.

2. Inspiration: Provide 3-5 bullet points of inspiration based on this text. Include:
   - Related information or topics that could be explored further
   - Ideas for potential industrial applications
   - Startup opportunities or innovative business ideas related to this content

Here's the text to analyze:

${text}

Please format your response as follows:
Summary: [Your concise summary here]

Inspiration:
• [Inspiration point 1]
• [Inspiration point 2]
• [Inspiration point 3]
...`;

      const data = {
        header: {
          app_id: APP_ID,
          uid: 'user'
        },
        parameter: {
          chat: {
            domain: 'general',
            temperature: 0.7,
            max_tokens: 1024
          }
        },
        payload: {
          message: {
            text: [
              { role: 'user', content: prompt }
            ]
          }
        }
      };

      socket.send(JSON.stringify(data));
    };

    let fullResponse = '';

    socket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.payload && response.payload.choices && response.payload.choices.text) {
        fullResponse += response.payload.choices.text[0].content;
      }
      if (response.header.code === 0 && response.header.status === 2) {
        socket.close();
        const parts = fullResponse.split('Inspiration:');
        const summary = parts[0].replace('Summary:', '').trim();
        const inspiration = parts[1] ? parts[1].trim() : 'No inspiration generated.';
        resolve({ summary, inspiration });
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      reject(error);
    };

    socket.onclose = () => {
      if (!fullResponse) {
        reject(new Error('WebSocket closed without receiving a complete response'));
      }
    };
  });
}