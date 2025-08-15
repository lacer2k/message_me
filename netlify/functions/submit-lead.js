// This is the server-side proxy function.
exports.handler = async function(event, context) {
  // The Google Apps Script URL is now hidden on the server.
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8mPlEiXfPQFG5ZiNBUgk-VIbLXjZqreRiYEdB5VXzZR9Y07Mo_AdzFVnKTyB91OAxrg/exec';

  // We only accept POST requests.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // The browser sends data as a string, so we parse it into a JavaScript object.
    const payload = JSON.parse(event.body);

    // This is our server-to-server request. It behaves exactly like curl.
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        // If Google's script returns an error, we forward it.
        return { statusCode: response.status, body: response.statusText };
    }
    
    // Success! We send a success response back to the browser.
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Lead submitted successfully' }),
    };

  } catch (error) {
    // Handle any errors.
    return { statusCode: 500, body: `Server error: ${error.message}` };
  }
};
