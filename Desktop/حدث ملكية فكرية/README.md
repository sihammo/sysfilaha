# Intellectual Property Conference Registration

A simple HTML registration form for an intellectual property conference.

## Features

- Responsive design with RTL support for Arabic
- Form validation
- Local storage for registrations
- Integration with Google Sheets via Google Apps Script
- Admin panel to view registrations

## Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t ip-conference-registration .

# Run the container
docker run -p 8080:80 ip-conference-registration
```

Access the application at `http://localhost:8080`

## Local Development

Simply open `index.html` in a web browser. No build process required.

## Configuration

Update the Google Apps Script URL in `index.html` (line 377) to point to your own script for Google Sheets integration.
