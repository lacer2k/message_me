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

        // --- KEY CHANGE IS HERE ---
        // We now build the payload with the new fields.
        // Optional fields use `|| ''` to send an empty string if left blank.
        const payload = {
            title: 'New Contact Form Submission', // Updated title for clarity
            name: formObject.name,
            surname: formObject.surname,
            mail: formObject.mail,
            whatsapp: formObject.whatsapp || '',
            telegram: formObject.telegram || '',
            reason: formObject.reason
        };
        // --- END OF KEY CHANGE ---

        fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            statusDiv.textContent = 'Success! Your message has been sent.';
            statusDiv.className = 'success';
            form.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            statusDiv.textContent = 'Error: Could not send message. Please try again.';
            statusDiv.className = 'error';
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit ->';
        });
    });
});
