// This is the updated client-side script.
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('leadForm');
    const submitButton = document.getElementById('submitButton');
    const statusDiv = document.getElementById('formStatus');

    // The ONLY change is this URL. It now points to our own proxy function.
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
            title: 'New Lead',
            name: formObject.name,
            email: formObject.email,
            budget: formObject.budget
        };

        // This fetch request now goes to our same-domain proxy. No CORS issues!
        fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(response => {
            if (!response.ok) {
                // If our proxy returns an error, we'll show it.
                throw new Error(`Server responded with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
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
