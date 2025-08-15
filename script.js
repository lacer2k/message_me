document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('leadForm');
    const submitButton = document.getElementById('submitButton');
    const statusDiv = document.getElementById('formStatus');

    // Your Google Apps Script Webhook URL
    const webhookUrl = 'https://script.google.com/macros/s/AKfycbz8mPlEiXfPQFG5ZiNBUgk-VIbLXjZqreRiYEdB5VXzZR9Y07Mo_AdzFVnKTyB91OAxrg/exec';

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Stop the form from reloading the page

        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        statusDiv.textContent = '';
        statusDiv.className = '';

        const formData = new FormData(form);
        const formObject = Object.fromEntries(formData.entries());

        const payload = {
            title: 'New Lead',
            name: formObject.name,
            email: formObject.email,
            budget: formObject.budget
        };

        // The Fetch Request with the FIX
        fetch(webhookUrl, {
            method: 'POST',
            // We no longer need 'mode: no-cors'
            // We change the Content-Type to make it a "simple request"
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload), // The body is still a JSON string
        })
        .then(response => {
            // Even though we get a response, we can't read its content from a different domain.
            // But getting here means the data was sent successfully.
            statusDiv.textContent = 'Success! Lead submitted.';
            statusDiv.className = 'success';
            form.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            statusDiv.textContent = 'Error: Could not submit lead. Please try again.';
            statusDiv.className = 'error';
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit ->';
        });
    });
});
