document.addEventListener('DOMContentLoaded', function() {
    // Generate Image Form
    const generateForm = document.getElementById('generate-form');
    const generateBtn = document.getElementById('generate-btn');
    const generateResult = document.getElementById('generate-result');
    const loadingSpinner = generateResult.querySelector('.loading-spinner');
    const resultImageContainer = generateResult.querySelector('.result-image-container');
    const resultImage = document.getElementById('result-image');
    const downloadBtn = document.getElementById('download-btn');
    const errorMessage = generateResult.querySelector('.error-message');
    const errorAlert = errorMessage.querySelector('.alert');

    // Edit Image Form
    const editForm = document.getElementById('edit-form');
    const editBtn = document.getElementById('edit-btn');
    const editResult = document.getElementById('edit-result');
    const editLoadingSpinner = editResult.querySelector('.loading-spinner');
    const editResultImageContainer = editResult.querySelector('.result-image-container');
    const editResultImage = document.getElementById('edit-result-image');
    const editDownloadBtn = document.getElementById('edit-download-btn');
    const editErrorMessage = editResult.querySelector('.error-message');
    const editErrorAlert = editErrorMessage.querySelector('.alert');
    
    // Edit mode radio buttons
    const modeRadios = document.querySelectorAll('input[name="edit-mode"]');
    const singleImageSection = document.getElementById('single-image-section');
    const referenceImagesSection = document.getElementById('reference-images-section');
    
    // Image & mask elements
    const imageFile = document.getElementById('image-file');
    const imageDropZone = document.getElementById('image-drop-zone');
    const imagePreviewThumb = document.getElementById('image-preview-thumb');
    
    const maskFile = document.getElementById('mask-file');
    const maskDropZone = document.getElementById('mask-drop-zone');
    const maskPreviewThumb = document.getElementById('mask-preview-thumb');
    
    const referenceImages = document.getElementById('reference-images');
    const referenceDropZone = document.getElementById('reference-drop-zone');
    const referencePreviewContainer = document.getElementById('reference-preview-container');

    // Handle mode switching
    modeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'single') {
                singleImageSection.classList.remove('d-none');
                referenceImagesSection.classList.add('d-none');
            } else {
                singleImageSection.classList.add('d-none');
                referenceImagesSection.classList.remove('d-none');
            }
        });
    });

    // Set up drag and drop for image upload
    setupDropZone(imageDropZone, imageFile, imagePreviewThumb, false);
    setupDropZone(maskDropZone, maskFile, maskPreviewThumb, false);
    setupDropZone(referenceDropZone, referenceImages, referencePreviewContainer, true);
    
    // Setup clipboard paste for images
    document.addEventListener('paste', function(e) {
        // Determine which drop zone is currently focused or clicked
        const activeElement = document.activeElement;
        let targetDropZone, targetInput, targetPreview, isMultiple;
        
        if (imageDropZone.contains(activeElement) || imageDropZone === document.activeElement) {
            targetDropZone = imageDropZone;
            targetInput = imageFile;
            targetPreview = imagePreviewThumb;
            isMultiple = false;
        } else if (maskDropZone.contains(activeElement) || maskDropZone === document.activeElement) {
            targetDropZone = maskDropZone;
            targetInput = maskFile;
            targetPreview = maskPreviewThumb;
            isMultiple = false;
        } else if (referenceDropZone.contains(activeElement) || referenceDropZone === document.activeElement) {
            targetDropZone = referenceDropZone;
            targetInput = referenceImages;
            targetPreview = referencePreviewContainer;
            isMultiple = true;
        } else {
            // No drop zone is focused, try to paste to the visible section
            if (!referenceImagesSection.classList.contains('d-none')) {
                targetDropZone = referenceDropZone;
                targetInput = referenceImages;
                targetPreview = referencePreviewContainer;
                isMultiple = true;
            } else {
                targetDropZone = imageDropZone;
                targetInput = imageFile;
                targetPreview = imagePreviewThumb;
                isMultiple = false;
            }
        }
        
        if (targetDropZone) {
            handlePaste(e, targetInput, targetPreview, isMultiple);
        }
    });
    
    // Image preview - handled by setupDropZone now
    imageFile.addEventListener('change', function() {
        updateThumbnail(imageDropZone, this, imagePreviewThumb, false);
    });

    maskFile.addEventListener('change', function() {
        updateThumbnail(maskDropZone, this, maskPreviewThumb, false);
    });

    referenceImages.addEventListener('change', function() {
        updateThumbnail(referenceDropZone, this, referencePreviewContainer, true);
    });

    // Generate Image Form Submission
    generateForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const prompt = document.getElementById('prompt').value;
        const model = document.getElementById('model').value;
        const size = document.getElementById('size').value;
        const quality = document.getElementById('quality').value;
        const background = document.getElementById('background').value;
        
        if (!prompt) {
            showError(errorAlert, errorMessage, 'Please enter a prompt');
            return;
        }
        
        // Reset UI
        hideElement(errorMessage);
        hideElement(resultImageContainer);
        showElement(loadingSpinner);
        generateBtn.disabled = true;
        
        // Send request to backend
        fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt,
                model,
                size,
                quality,
                background
            })
        })
        .then(response => response.json())
        .then(data => {
            generateBtn.disabled = false;
            hideElement(loadingSpinner);
            
            if (data.success) {
                resultImage.src = 'data:image/png;base64,' + data.image;
                showElement(resultImageContainer);
            } else {
                showError(errorAlert, errorMessage, 'Error: ' + data.error);
            }
        })
        .catch(error => {
            generateBtn.disabled = false;
            hideElement(loadingSpinner);
            showError(errorAlert, errorMessage, 'Error: ' + error.message);
        });
    });

    // Edit Image Form Submission
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const editMode = document.querySelector('input[name="edit-mode"]:checked').value;
        
        if (editMode === 'single' && !imageFile.files[0]) {
            showError(editErrorAlert, editErrorMessage, 'Please upload an image');
            return;
        }
        
        if (editMode === 'reference' && (!imageFile.files[0] || !referenceImages.files.length)) {
            showError(editErrorAlert, editErrorMessage, 'Please upload at least one reference image');
            return;
        }
        
        // Reset UI
        hideElement(editErrorMessage);
        hideElement(editResultImageContainer);
        showElement(editLoadingSpinner);
        editBtn.disabled = true;
        
        // Create FormData
        const formData = new FormData();
        formData.append('prompt', document.getElementById('edit-prompt').value);
        formData.append('model', document.getElementById('edit-model').value);
        formData.append('size', document.getElementById('edit-size').value);
        formData.append('quality', document.getElementById('edit-quality').value);
        
        if (editMode === 'single') {
            formData.append('image', imageFile.files[0]);
            if (maskFile.files[0]) {
                formData.append('mask', maskFile.files[0]);
            }
        } else {
            formData.append('image', imageFile.files[0]);
            
            for (let i = 0; i < referenceImages.files.length; i++) {
                formData.append('additional_images', referenceImages.files[i]);
            }
        }
        
        // Send request to backend
        fetch('/edit', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            editBtn.disabled = false;
            hideElement(editLoadingSpinner);
            
            if (data.success) {
                editResultImage.src = 'data:image/png;base64,' + data.image;
                showElement(editResultImageContainer);
            } else {
                showError(editErrorAlert, editErrorMessage, 'Error: ' + data.error);
            }
        })
        .catch(error => {
            editBtn.disabled = false;
            hideElement(editLoadingSpinner);
            showError(editErrorAlert, editErrorMessage, 'Error: ' + error.message);
        });
    });

    // Download buttons and further editing functionality
    downloadBtn.addEventListener('click', function() {
        downloadImage(resultImage.src, 'generated-image.png');
    });
    
    document.getElementById('use-for-edit-btn').addEventListener('click', function() {
        // Switch to edit tab
        document.getElementById('edit-tab').click();
        
        // Select reference images mode
        document.getElementById('mode-reference').checked = true;
        document.getElementById('mode-reference').dispatchEvent(new Event('change'));
        
        // Convert img src to File object and add to the reference images input
        fetch(resultImage.src)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'generated-image.png', { type: 'image/png' });
                
                // Create a new DataTransfer and add the file
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                
                // Set the files to the input
                referenceImages.files = dataTransfer.files;
                
                // Update the thumbnail
                updateThumbnail(referenceDropZone, referenceImages, referencePreviewContainer, true);
                
                // Set focus to the prompt field
                document.getElementById('edit-prompt').focus();
            });
    });
    
    editDownloadBtn.addEventListener('click', function() {
        downloadImage(editResultImage.src, 'edited-image.png');
    });
    
    document.getElementById('edit-again-btn').addEventListener('click', function() {
        // Stay in edit tab, but reuse the edited image
        
        // Determine active editing mode
        const isReferenceMode = document.getElementById('mode-reference').checked;
        
        // Convert img src to File object
        fetch(editResultImage.src)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'edited-image.png', { type: 'image/png' });
                
                if (isReferenceMode) {
                    // If in reference mode, use it as a reference image
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    
                    // Set the files to the input
                    referenceImages.files = dataTransfer.files;
                    
                    // Update thumbnail
                    updateThumbnail(referenceDropZone, referenceImages, referencePreviewContainer, true);
                } else {
                    // If in single image mode, use it as the main image
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    
                    // Set the files to the input
                    imageFile.files = dataTransfer.files;
                    
                    // Update thumbnail
                    updateThumbnail(imageDropZone, imageFile, imagePreviewThumb, false);
                }
                
                // Hide result and clear prompt
                hideElement(editResultImageContainer);
                document.getElementById('edit-prompt').value = '';
                document.getElementById('edit-prompt').focus();
            });
    });
    
    document.getElementById('use-in-generation-btn').addEventListener('click', function() {
        // Switch to generate tab
        document.getElementById('generate-tab').click();
        
        // Set focus to the prompt field
        document.getElementById('prompt').focus();
        
        // Hide the previous generation result
        hideElement(resultImageContainer);
    });

    // Helper Functions
    function showElement(element) {
        element.classList.remove('d-none');
    }
    
    function hideElement(element) {
        element.classList.add('d-none');
    }
    
    function showError(alertElement, container, message) {
        alertElement.textContent = message;
        showElement(container);
    }
    
    // Setup drop zone for drag and drop functionality
    function setupDropZone(dropZoneElement, inputElement, previewElement, isMultiple) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZoneElement.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZoneElement.addEventListener(eventName, function() {
                dropZoneElement.classList.add('drop-zone-drag');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZoneElement.addEventListener(eventName, function() {
                dropZoneElement.classList.remove('drop-zone-drag');
            });
        });
        
        // Handle dropped files
        dropZoneElement.addEventListener('drop', function(e) {
            let dt = e.dataTransfer;
            let files = dt.files;
            
            // Handle multiple file selection for reference images
            if (isMultiple) {
                if (files.length > 0) {
                    // Create a FileList-like object
                    let dataTransfer = new DataTransfer();
                    
                    // Add dropped files
                    for (let i = 0; i < files.length; i++) {
                        if (files[i].type.startsWith('image/')) {
                            dataTransfer.items.add(files[i]);
                        }
                    }
                    
                    // Set the files to the input element
                    inputElement.files = dataTransfer.files;
                    
                    // Update thumbnails
                    updateThumbnail(dropZoneElement, inputElement, previewElement, isMultiple);
                }
            } else {
                // For single file uploads, just use the first file
                if (files.length > 0 && files[0].type.startsWith('image/')) {
                    inputElement.files = files;
                    updateThumbnail(dropZoneElement, inputElement, previewElement, isMultiple);
                }
            }
        });
        
        // Click to upload
        dropZoneElement.addEventListener('click', function() {
            inputElement.click();
        });
    }
    
    // Handle paste events for images
    function handlePaste(e, inputElement, previewElement, isMultiple) {
        if (e.clipboardData && e.clipboardData.items) {
            const items = e.clipboardData.items;
            let imageItems = [];
            
            // Collect all image items from clipboard
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    imageItems.push(items[i]);
                }
            }
            
            if (imageItems.length > 0) {
                e.preventDefault();
                
                if (isMultiple) {
                    // For multiple file inputs (reference images)
                    let dataTransfer = new DataTransfer();
                    
                    // Add existing files if any
                    if (inputElement.files) {
                        for (let i = 0; i < inputElement.files.length; i++) {
                            dataTransfer.items.add(inputElement.files[i]);
                        }
                    }
                    
                    // Add clipboard images
                    for (let i = 0; i < imageItems.length; i++) {
                        const blob = imageItems[i].getAsFile();
                        if (blob) {
                            dataTransfer.items.add(new File([blob], `pasted-image-${Date.now()}-${i}.png`, { type: blob.type }));
                        }
                    }
                    
                    // Update input files
                    inputElement.files = dataTransfer.files;
                } else {
                    // For single file inputs, just use the first image
                    const blob = imageItems[0].getAsFile();
                    if (blob) {
                        let dataTransfer = new DataTransfer();
                        dataTransfer.items.add(new File([blob], `pasted-image-${Date.now()}.png`, { type: blob.type }));
                        inputElement.files = dataTransfer.files;
                    }
                }
                
                // Update the preview
                updateThumbnail(inputElement.parentElement, inputElement, previewElement, isMultiple);
            }
        }
    }
    
    // Update thumbnail preview
    function updateThumbnail(dropZone, input, previewElement, isMultiple) {
        if (!input.files || input.files.length === 0) {
            return;
        }
        
        if (isMultiple) {
            // Clear previews
            previewElement.innerHTML = '';
            
            // Create thumbnails for each file
            for (let i = 0; i < input.files.length; i++) {
                if (!input.files[i].type.startsWith('image/')) continue;
                
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const thumbItem = document.createElement('div');
                    thumbItem.classList.add('thumb-item');
                    thumbItem.style.backgroundImage = `url('${e.target.result}')`;
                    
                    const removeBtn = document.createElement('div');
                    removeBtn.classList.add('remove-image');
                    removeBtn.innerHTML = '×';
                    removeBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        removeFile(input, i);
                        thumbItem.remove();
                    });
                    
                    thumbItem.appendChild(removeBtn);
                    previewElement.appendChild(thumbItem);
                };
                
                reader.readAsDataURL(input.files[i]);
            }
            
            // Show the container with thumbnails
            previewElement.style.display = 'flex';
            
            // Hide the prompt text if files are added
            if (input.files.length > 0) {
                dropZone.querySelector('.drop-zone-prompt').style.display = 'none';
            } else {
                dropZone.querySelector('.drop-zone-prompt').style.display = 'block';
            }
        } else {
            // For single image upload
            const file = input.files[0];
            if (!file.type.startsWith('image/')) return;
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Set the background image of the thumbnail div
                previewElement.style.backgroundImage = `url('${e.target.result}')`;
                previewElement.style.display = 'block';
                
                // Hide the prompt text
                dropZone.querySelector('.drop-zone-prompt').style.display = 'none';
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    // Remove a file from the input's FileList
    function removeFile(input, index) {
        if (input.files && input.files.length > 0) {
            let dataTransfer = new DataTransfer();
            
            for (let i = 0; i < input.files.length; i++) {
                if (i !== index) {
                    dataTransfer.items.add(input.files[i]);
                }
            }
            
            input.files = dataTransfer.files;
            
            // Show the prompt text if no files remain
            if (input.files.length === 0) {
                input.parentElement.querySelector('.drop-zone-prompt').style.display = 'block';
            }
        }
    }
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});