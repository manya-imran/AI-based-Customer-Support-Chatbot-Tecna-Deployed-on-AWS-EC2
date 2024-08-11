// pages/api/chat.js
// export default function handler(req, res) {
//     res.status(200).json({ message: "API is working!" });
//     console.log('chat')
// }
import OpenAI from 'openai';
import { Readable } from 'stream';
// Assuming you have these packages available
// import RAGApplicationBuilder from '@llm-tools/embedjs';
// import { LanceDb } from '@llm-tools/embedjs/vectorDb/lance';
import fs from 'fs';
import pdfParse from 'pdf-parse';

// Define system prompt
const systemPrompt = `
    Your name is Tecna, and you are a woman bot. You are an AI-powered customer support chatbot for an organization that provides AI-powered solutions called AIM-Tech. Your role is to assist users with their inquiries, troubleshoot issues, provide detailed information about the organization's products and services, and guide them in customizing solutions to meet their needs.

    When interacting with users:

    1. Greet them warmly and introduce yourself as a virtual assistant here to help, mentioning your name and company.
    2. Encourage users to describe their issues or questions clearly and concisely.
    3. Demonstrate deep knowledge of all products and services offered, including features, pricing, and benefits.
    4. Provide step-by-step troubleshooting guidance for common issues and link to relevant documentation when needed.
    5. Assist users in customizing AI solutions and highlight the flexibility and scalability of the products.
    6. Offer upgrade or additional service options where appropriate, in a helpful and non-intrusive manner.
    7. Reassure users about the organization’s commitment to data privacy and security.
    8. Conclude conversations politely, offering further assistance if needed, and wishing the user a great day.
`;

// Function to load and parse PDFs
async function loadPDFs(filePaths) {
    const pdfTexts = [];
    for (const filePath of filePaths) {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        pdfTexts.push(data.text);
    }
    return pdfTexts;
}

// Function to perform retrieval (simplified example)
function retrieveRelevantDocs(query, documents) {
    // A very basic retrieval logic that searches for the query within the documents.
    // In practice, you would use more advanced techniques like embedding-based similarity search.
    return documents.filter(doc => doc.includes(query)).slice(0, 2); // Return top 2 matches
}

// Handle POST request
export default async function handler(req, res) {
    try {
        // Create OpenAI instance
        const openai = new OpenAI();

        // Get JSON data from request
        const data = await req.body;

        // Load and parse PDFs
        const pdfTexts = await loadPDFs(['E:/1 -Top/AI-powered-Customer-Support-Hosted-AWS/frontend/latest/public/Products.pdf', 'E:/1 -Top/AI-powered-Customer-Support-Hosted-AWS/frontend/latest/public/Services.pdf']); 

        // Retrieve relevant documents based on the user's input
        const userMessage = data.find(msg => msg.role === 'user')?.content || '';
        const relevantDocs = retrieveRelevantDocs(userMessage, pdfTexts);

        // Create an augmented prompt by including the retrieved documents
        const augmentedPrompt = `
            Relevant information from the documentation:

            ${relevantDocs.join('\n\n')}

            Continue with the conversation:
        `;

        // Create chat completion with OpenAI
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "assistant", content: augmentedPrompt },
                ...data, // Spread the rest of the messages
            ],
            model: "gpt-4o-mini",
            stream: true,
        });

        // Create a readable stream
        const stream = new Readable({
            async read() {
                const encoder = new TextEncoder();
                try {
                    // Iterate over each chunk of completion
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            // Encode the content and send it to the stream
                            const text = encoder.encode(content);
                            this.push(text);
                        }
                    }
                    this.push(null); // End of stream
                } catch (err) {
                    this.emit('error', err);
                }
            }
        });

        // Set the appropriate headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Pipe the stream to the response
        stream.pipe(res);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


//---------------------WORK
// import OpenAI from 'openai';
// import { Readable } from 'stream';
// // import RAGApplicationBuilder from '@llm-tools/embedjs';
// // import { LanceDb } from '@llm-tools/embedjs/vectorDb/lance';


// // Define system prompt
// const systemPrompt = `
//     Your name is Tecna you are a woman bot. You are an AI-powered customer support chatbot for an organization that provides AI-powered solutions called AIM-Tech. Your role is to assist users with their inquiries, troubleshoot issues, provide detailed information about the organization's products and services, and guide them in customizing solutions to meet their needs.

//     When interacting with users:

//     1. Greet them warmly and introduce yourself as a virtual assistant here to help and add your name and company.
//     2. Encourage users to describe their issues or questions clearly and concisely.
//     3. Demonstrate deep knowledge of all products and services offered, including features, pricing, and benefits.
//     4. Provide step-by-step troubleshooting guidance for common issues and link to relevant documentation when needed.
//     5. Assist users in customizing AI solutions and highlight the flexibility and scalability of the products.
//     6. Offer upgrade or additional service options where appropriate, in a helpful and non-intrusive manner.
//     7. Reassure users about the organization’s commitment to data privacy and security.
//     8. Conclude conversations politely, offering further assistance if needed and wishing the user a great day.
// `;

// // Handle POST request
// export default async function handler(req, res) {
//     try {
//         // Create OpenAI instance
//         const openai = new OpenAI();

//         // Get JSON data from request
//         const data = await req.body;
//         // const ragApplication = await new RAGApplicationBuilder()
//         // .setModel(new OpenAi({ modelName: 'gpt-4o-mini' }))
//         // .addLoader(new PdfLoader({ filePathOrUrl: path.resolve('../../public/Products.pdf') }))
//         // .addLoader(new PdfLoader({ filePathOrUrl: path.resolve('../../public/Services.pdf') }))
//         // .setVectorDb(new LanceDb({ path: path.resolve('/db') }))
//         // .build();
//         // const rag_response = await ragApplication.query('What are your services?');
//         // console.log(rag_response)

//         // Create chat completion with OpenAI
//         const completion = await openai.chat.completions.create({
//             messages: [
//                 { role: "system", content: systemPrompt },
//                 ...data, // Spread the rest of the messages
//             ],
//             model: "gpt-4o-mini",
//             stream: true,
//         });

//         // Create a readable stream
//         const stream = new Readable({
//             async read() {
//                 const encoder = new TextEncoder();
//                 try {
//                     // Iterate over each chunk of completion
//                     for await (const chunk of completion) {
//                         const content = chunk.choices[0]?.delta?.content;
//                         if (content) {
//                             // Encode the content and send it to the stream
//                             const text = encoder.encode(content);
//                             this.push(text);
//                         }
//                     }
//                     this.push(null); // End of stream
//                 } catch (err) {
//                     this.emit('error', err);
//                 }
//             }
//         });

//         // Set the appropriate headers for streaming
//         res.setHeader('Content-Type', 'text/event-stream');
//         res.setHeader('Cache-Control', 'no-cache');
//         res.setHeader('Connection', 'keep-alive');

//         // Pipe the stream to the response
//         stream.pipe(res);

//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }


// import { NextResponse } from 'next/server';
// import OpenAI from 'openai';
// import { Readable } from 'stream';

// // Define system prompt
// const systemPrompt = `
//     You are an AI-powered customer support chatbot for an organization that provides AI-powered solutions. Your role is to assist users with their inquiries, troubleshoot issues, provide detailed information about the organization's products and services, and guide them in customizing solutions to meet their needs.

//     When interacting with users:

//     1. Greet them warmly and introduce yourself as a virtual assistant here to help.
//     2. Encourage users to describe their issues or questions clearly and concisely.
//     3. Demonstrate deep knowledge of all products and services offered, including features, pricing, and benefits.
//     4. Provide step-by-step troubleshooting guidance for common issues and link to relevant documentation when needed.
//     5. Assist users in customizing AI solutions and highlight the flexibility and scalability of the products.
//     6. Offer upgrade or additional service options where appropriate, in a helpful and non-intrusive manner.
//     7. Reassure users about the organization’s commitment to data privacy and security.
//     8. Conclude conversations politely, offering further assistance if needed and wishing the user a great day.
// `;

// // Handle POST request
// export default async function handler(req, res) {
//     // Create OpenAI instance
//     const openai = new OpenAI();

//     // Get JSON data from request
//     const data = await req.body;
//     console.log(data)
//     // Create chat completion with OpenAI
//     const completion = await openai.chat.completions.create({
//         messages: [
//             { role: "system", content: systemPrompt },
//             ...data, // Spread the rest of the messages
//         ],
//         model: "gpt-4o-mini",
//         stream: true,
//     });
//     console.log(completion)

//     // Create a readable stream
//     const stream = new Readable({
//         async start(controller) {
//             const encoder = new TextEncoder();
//             try {
//                 // Iterate over each chunk of completion
//                 for await (const chunk of completion) {
//                     const content = chunk.choices[0]?.delta?.content;
//                     if (content) {
//                         // Encode the content and send it to the stream
//                         const text = encoder.encode(content);
//                         controller.enqueue(text);
//                     }
//                 }
//             } catch (err) {
//                 controller.error(err);
//             } finally {
//                 controller.close();
//             }
//         }
//     });

//     // Set the appropriate headers for streaming
//     const response = new NextResponse(stream);
//     response.headers.set('Content-Type', 'text/event-stream');
//     response.headers.set('Cache-Control', 'no-cache');
//     response.headers.set('Connection', 'keep-alive');
//     return response;
// }


// // import { NextResponse } from 'next/server';
// // import OpenAI from 'openai';
// import { Readable } from 'stream';

// // Define system prompt
// const systemPrompt = `
//     You are an AI-powered customer support chatbot for an organization that provides AI-powered solutions. Your role is to assist users with their inquiries, troubleshoot issues, provide detailed information about the organization's products and services, and guide them in customizing solutions to meet their needs.

//     When interacting with users:

//     1. Greet them warmly and introduce yourself as a virtual assistant here to help.
//     2. Encourage users to describe their issues or questions clearly and concisely.
//     3. Demonstrate deep knowledge of all products and services offered, including features, pricing, and benefits.
//     4. Provide step-by-step troubleshooting guidance for common issues and link to relevant documentation when needed.
//     5. Assist users in customizing AI solutions and highlight the flexibility and scalability of the products.
//     6. Offer upgrade or additional service options where appropriate, in a helpful and non-intrusive manner.
//     7. Reassure users about the organization’s commitment to data privacy and security.
//     8. Conclude conversations politely, offering further assistance if needed and wishing the user a great day.
// `;



// export default async function handler(req, res) {
//     //create OpenAI instance
//     const openai = new OpenAI()
//     //get json from req
//     console.log(req.body)
//     const data = JSON.parse(req.body[0]);
//     console.log(data)

//     //chat completion returned by openai
//     const completion = await openai.chat.completions.create({
//         messages: [{ 
//             role: "system", 
//             content: systemPrompt, 
//         },
//         ...data, //...spread the rest of the data msgs
//     ],
//         model: "gpt-4o-mini",
//         stream:true,
//     })
// }
//     if (req.method !== 'POST') {
//         return res.status(405).json({ error: 'Method not allowed' });
//     }

//     try {
//         const openai = new OpenAI();
//         console.log(req.body)
//         // Collect the body data
//         const buffers = [];
//         for await (const chunk of req) {
//             buffers.push(chunk);
//         }
//         const body = Buffer.concat(buffers).toString();

//         // Check if body is empty
//         if (!body) {
//             return res.status(400).json({ error: 'Request body is empty' });
//         }

//         // Parse the JSON data
//         let data;
//         try {
//             data = JSON.parse(body);
//         } catch (jsonError) {
//             return res.status(400).json({ error: 'Invalid JSON' });
//         }

//         // Create chat completion with OpenAI
//         const completion = await openai.chat.completions.create({
//             messages: [
//                 { role: "system", content: systemPrompt },
//                 ...data.messages // Ensure data contains messages
//             ],
//             model: "gpt-4o-mini", // using gpt mini
//             stream: true
//         });

//         // Create a readable stream
//         const stream = new Readable({
//             async start(controller) {
//                 const encoder = new TextEncoder();
//                 try {
//                     for await (const chunk of completion) {
//                         const content = chunk.choices[0]?.delta?.content;
//                         if (content) {
//                             controller.enqueue(encoder.encode(content));
//                         }
//                     }
//                 } catch (err) {
//                     controller.error(err);
//                 } finally {
//                     controller.close();
//                 }
//             }
//         });

//         // Set headers and return the stream as response
//         res.setHeader('Content-Type', 'text/event-stream');
//         res.setHeader('Cache-Control', 'no-cache');
//         res.setHeader('Connection', 'keep-alive');
//         stream.pipe(res);
//     } catch (error) {
//         console.error('Error handling request:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }


// // import { NextResponse } from 'next/server';
// // import OpenAI from 'openai';
// // import { Readable } from 'stream';

// // // Define system prompt
// // const systemPrompt = `
// //     You are an AI-powered customer support chatbot for an organization that provides AI-powered solutions. Your role is to assist users with their inquiries, troubleshoot issues, provide detailed information about the organization's products and services, and guide them in customizing solutions to meet their needs.

// //     When interacting with users:

// //     1. Greet them warmly and introduce yourself as a virtual assistant here to help.
// //     2. Encourage users to describe their issues or questions clearly and concisely.
// //     3. Demonstrate deep knowledge of all products and services offered, including features, pricing, and benefits.
// //     4. Provide step-by-step troubleshooting guidance for common issues and link to relevant documentation when needed.
// //     5. Assist users in customizing AI solutions and highlight the flexibility and scalability of the products.
// //     6. Offer upgrade or additional service options where appropriate, in a helpful and non-intrusive manner.
// //     7. Reassure users about the organization’s commitment to data privacy and security.
// //     8. Conclude conversations politely, offering further assistance if needed and wishing the user a great day.
// // `;

// // // Handle POST request
// // export default async function handler(req, res) {
// //     const openai = new OpenAI();

// //     // Get JSON data from request
// //     const data = await req.json();

// //     // Create chat completion with OpenAI
// //     const completion = await openai.chat.completions.create({
// //         messages: [
// //             { role: "system", content: systemPrompt },
// //             ...data.messages // Ensure data contains messages
// //         ],
// //         model: "gpt-4o-mini", // using gpt mini
// //         stream: true
// //     });

// //     // Create a readable stream
// //     const stream = new Readable({
// //         async start(controller) {
// //             const encoder = new TextEncoder();
// //             try {
// //                 for await (const chunk of completion) {
// //                     const content = chunk.choices[0]?.delta?.content;
// //                     if (content) {
// //                         controller.enqueue(encoder.encode(content));
// //                     }
// //                 }
// //             } catch (err) {
// //                 controller.error(err);
// //             } finally {
// //                 controller.close();
// //             }
// //         }
// //     });

// //     // Set headers for server-sent events
// //     res.setHeader('Content-Type', 'text/event-stream');
// //     res.setHeader('Cache-Control', 'no-cache');
// //     res.setHeader('Connection', 'keep-alive');

// //     // Return the response as a stream
// //     stream.pipe(res);
// // }
