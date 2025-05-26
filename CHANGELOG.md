# Changelog

## [2.0.0] - 2024-12-19

### 🔴 CRITICAL SECURITY FIXES
- **FIXED**: Removed exposed OpenAI API key from `.env` file
- **ADDED**: Proper `.env.example` template with security guidelines
- **ADDED**: Input validation and sanitization for all user inputs
- **ADDED**: Secure file handling with proper validation
- **ADDED**: Security headers (XSS protection, content type options, frame options)
- **ADDED**: File size limits and type validation
- **ADDED**: Secure temporary file handling with cleanup

### 🔴 CRITICAL API FIXES
- **FIXED**: Replaced non-existent `gpt-image-1` model with correct `dall-e-3`
- **FIXED**: Updated to use DALL-E 2 for image editing (only supported model)
- **FIXED**: Corrected API parameters (quality: standard/hd instead of auto/low/medium/high)
- **FIXED**: Updated image sizes to match DALL-E 3 specifications
- **REMOVED**: Background transparency option (not supported by DALL-E 3)
- **FIXED**: Proper API response handling with b64_json format

### 🔴 FUNCTIONALITY FIXES
- **FIXED**: Multiple reference images feature (converted to variations due to API limitations)
- **FIXED**: Proper error handling throughout the application
- **FIXED**: Memory leaks in file handling
- **FIXED**: Temporary file cleanup issues
- **ADDED**: Comprehensive logging system
- **ADDED**: Proper exception handling with user-friendly error messages

### 🔴 DEPENDENCY UPDATES
- **UPDATED**: OpenAI library to >=1.51.0 (latest secure version)
- **UPDATED**: Flask to >=3.0.0 (latest secure version)
- **UPDATED**: Werkzeug to >=3.0.0 (security updates)
- **UPDATED**: Requests to >=2.31.0 (security updates)
- **ADDED**: Pillow for image validation
- **ADDED**: Security package for additional protection

### 🟡 IMPROVEMENTS
- **ADDED**: Proper input sanitization (prompt length limits, XSS prevention)
- **ADDED**: File type validation using PIL
- **ADDED**: Secure filename generation
- **ADDED**: Better error messages for users
- **ADDED**: Request validation and JSON parsing
- **IMPROVED**: Code organization and documentation
- **IMPROVED**: Frontend validation and user experience

### 🟡 UI/UX UPDATES
- **UPDATED**: Model selection to show correct DALL-E models
- **UPDATED**: Size options to match API specifications
- **UPDATED**: Quality options (Standard/HD)
- **REMOVED**: Background option (not supported)
- **IMPROVED**: Error messaging in frontend
- **UPDATED**: Form validation

### 📚 DOCUMENTATION
- **UPDATED**: README with correct setup instructions
- **ADDED**: Security notice and best practices
- **UPDATED**: Feature descriptions to match actual capabilities
- **ADDED**: Comprehensive changelog
- **UPDATED**: Requirements and limitations

### 🧪 TESTING RECOMMENDATIONS
- Test image generation with various prompts
- Test image editing with masks
- Test file upload validation
- Test error handling scenarios
- Verify security headers are present
- Test with invalid API keys
- Test file size limits
- Test clipboard paste functionality

### ⚠️ BREAKING CHANGES
- API model changed from `gpt-image-1` to `dall-e-3`
- Quality options changed from auto/low/medium/high to standard/hd
- Background transparency option removed
- Multiple reference images converted to variations
- Size options updated for DALL-E 3 compatibility

### 🔧 MIGRATION NOTES
- Update your `.env` file with a valid OpenAI API key
- No code changes needed for existing functionality
- Some advanced features may work differently due to API limitations
