document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('leadForm');
    const submitButton = document.getElementById('submitButton');
    const statusDiv = document.getElementById('formStatus');

    // Your Google Apps Script Webhook URL
    const webhookUrl = 'https://script.google.com/macros/s/AKfycbz8mPlEiXfPQFG5ZiNBUgk-VIbLXjZqreRiYEdB5VXzZR9Y07Mo_AdzFVnKTyB91OAxrg/exec';

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Stop the form from reloading the page

        // Disable button and show sending status
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        statusDiv.textContent = '';
        statusDiv.className = '';

        // Get form data
        const formData = new FormData(form);
        const formObject = Object.fromEntries(formData.entries());

        // Construct the final JSON payload
        const payload = {
            title: 'New Lead', // The title is hard-coded as requested
            name: formObject.name,
            email: formObject.email,
            budget: formObject.budget
        };

        // Send the data to the webhook
        fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors', // IMPORTANT: Use 'no-cors' to avoid CORS issues with Google Scripts from a browser
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(() => {
            // Because of 'no-cors', we can't read the response. We assume success if no network error occurs.
            statusDiv.textContent = 'Success! Lead submitted.';
            statusDiv.className = 'success';
            form.reset(); // Clear the form fields
        })
        .catch(error => {
            console.error('Error:', error);
            statusDiv.textContent = 'Error: Could not submit lead. Please try again.';
            statusDiv.className = 'error';
        })
        .finally(() => {
            // Re-enable the button after the request is complete
            submitButton.disabled = false;
            submitButton.textContent = 'Submit ->';
        });
    });
});
