document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('leadForm');
    const submitButton = document.getElementById('submitButton');
    const statusDiv = document.getElementById('formStatus');

    const proxyUrl = '/.netlify/functions/submit-lead';

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        statusDiv.textContent = '';
        statusDiv.className = '';

        const formData = new FormData(form);
        const formObject = Object.fromEntries(formData.entries());

        const payload = {
            title: 'New Contact Form Submission',
            name: formObject.name,
            surname: formObject.surname,
            mail: formObject.mail,
            whatsapp: formObject.whatsapp || '',
            telegram: formObject.telegram || '',
            reason: formObject.reason
        };

        fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        .then(async response => {
            // --- KEY CHANGE IS HERE ---
            // If the response is not OK, we try to get the specific error message from our function.
            if (!response.ok) {
                const errorData = await response.json();
                // Use the specific message from our Netlify function, or a generic one.
                throw new Error(errorData.message || `Server responded with status: ${response.status}`);
            }
            return response.json();
            // --- END OF KEY CHANGE ---
        })
        .then(data => {
            statusDiv.textContent = 'Success! Your message has been sent.';
            statusDiv.className = 'success';
            form.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            // Now this will display our custom error message (e.g., "Email address appears to be invalid...")
            statusDiv.textContent = `Error: ${error.message}`;
            statusDiv.className = 'error';
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit ->';
        });
    });
});
