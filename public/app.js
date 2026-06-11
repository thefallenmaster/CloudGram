document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const uploadContent = document.querySelector('.upload-content');
    const loadingState = document.getElementById('loading-state');
    const resultSection = document.getElementById('result-section');
    const uploadSection = document.querySelector('.upload-section');
    const previewImage = document.getElementById('preview-image');
    const imageUrlInput = document.getElementById('image-url');
    const copyBtn = document.getElementById('copy-btn');
    const uploadAnotherBtn = document.getElementById('upload-another-btn');
    const toast = document.getElementById('toast');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('dragover');
    }

    function unhighlight(e) {
        dropZone.classList.remove('dragover');
    }

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Handle browse button
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent double triggering
        fileInput.click();
    });

    // Make entire dropzone click trigger file input
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        
        // Validate it's an image
        if (!file.type.startsWith('image/')) {
            showToast('Please upload an image file (JPEG, PNG, GIF, WebP)', true);
            return;
        }

        // Validate size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            showToast('File size must be under 10MB', true);
            return;
        }

        uploadFile(file);
    }

    async function uploadFile(file) {
        // Show loading state
        uploadContent.classList.add('hidden');
        loadingState.classList.remove('hidden');

        // Create local preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Success!
                imageUrlInput.value = data.url;
                
                // Hide upload, show result
                uploadSection.classList.add('hidden');
                resultSection.classList.remove('hidden');
                
                showToast('Image uploaded successfully! 🎉');
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            showToast(error.message, true);
            
            // Reset UI
            uploadContent.classList.remove('hidden');
            loadingState.classList.add('hidden');
        }
    }

    // Copy URL logic
    copyBtn.addEventListener('click', () => {
        imageUrlInput.select();
        imageUrlInput.setSelectionRange(0, 99999); // For mobile devices
        
        navigator.clipboard.writeText(imageUrlInput.value)
            .then(() => {
                showToast('URL copied to clipboard! 📋');
                copyBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Copied
                `;
                copyBtn.style.color = 'var(--success)';
                copyBtn.style.borderColor = 'var(--success)';
                
                setTimeout(() => {
                    copyBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                    `;
                    copyBtn.style.color = '';
                    copyBtn.style.borderColor = '';
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                showToast('Failed to copy URL', true);
            });
    });

    // Upload another
    uploadAnotherBtn.addEventListener('click', () => {
        resultSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        uploadContent.classList.remove('hidden');
        loadingState.classList.add('hidden');
        fileInput.value = '';
    });

    // Toast notification
    let toastTimeout;
    function showToast(message, isError = false) {
        toast.textContent = message;
        
        if (isError) {
            toast.style.borderColor = 'var(--error)';
            toast.style.color = '#ff9999';
        } else {
            toast.style.borderColor = 'var(--glass-border)';
            toast.style.color = 'white';
        }
        
        toast.classList.remove('hidden');
        // Force reflow
        void toast.offsetWidth;
        toast.classList.add('show');
        
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 400); // match transition time
        }, 3000);
    }
});
