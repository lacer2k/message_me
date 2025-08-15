document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('leadForm');
    const submitButton = document.getElementById('submitButton');
    const statusDiv = document.getElementById('formStatus');

    const webhookUrl = 'https://script.google.com/macros/s/AKfycbz8mPlEiXfPQFG5ZiNBUgk-VIbLXjZqreRiYEdB5VXzZR9Y07Mo_AdzFVnKTyB91OAxrg/exec';

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        statusDiv.textContent = '';
        statusDiv.className = '';

        const formData = new FormData(form);
        const formObject = Object.fromEntries(formData.entries());

        // Combine the fixed title with the data from the form
        const dataToSend = {
            title: 'New Lead',
            name: formObject.name,
            email: formObject.email,
            budget: formObject.budget
        };

        // This is the key change: We convert our object into a URL-encoded string.
        // e.g., "title=New%20Lead&name=Mario%20Rossi&..."
        const urlEncodedData = new URLSearchParams(dataToSend);

        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                // We explicitly set the Content-Type to what a normal form would send.
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            // The body is now the URL-encoded data.
            body: urlEncodedData,
        })
        .then(response => {
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
