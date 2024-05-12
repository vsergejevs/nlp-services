# NLP Services

Welcome to `nlp-services`, a versatile API designed to harness the power of Natural Language Processing (NLP) through both Google Cloud's Natural Language API and AWS Comprehend. This project aims to provide a unified interface for performing sentiment analysis, entity recognition, and content classification by abstracting the complexities of directly interacting with each NLP service.

## Features

- **Dual NLP Integration**: Seamlessly switch between or combine results from Google Cloud's Natural Language API and AWS Comprehend for comprehensive text analysis.
- **Sentiment Analysis**: Determine the sentiment of input text, supporting a broad range of applications from customer feedback analysis to social media monitoring.
- **Entity Recognition**: Identify and categorize entities within text to extract valuable insights and metadata.
- **Content Classification**: Automatically classify text into predefined categories, enhancing content discoverability and organization.

## Getting Started

### Prerequisites

- Node.js, Nest.Js and npm installed on your machine
- Docker for containerization and deployment
- Access to Google Cloud Platform and AWS services
- MongoDB instance running and accessible

### Setup

1. **Clone the Repository**

```bash
git clone https://github.com/vsergejevs/nlp-services.git
cd nlp-services
```

2. **Configure Environment Variables**

Create a `.env` file in the root directory and populate it with your Google Cloud and AWS credentials:

```
GOOGLE_APPLICATION_CREDENTIALS=<path-to-your-google-credentials.json>
AWS_ACCESS_KEY_ID=<your-aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
MONGODB_URI=<your-mongodb-connection-string>
```

3. **Install Dependencies**

```bash
npm install
```

4. **Run Locally**

```bash
npm run start
```

Your API is now running and can be accessed at `http://localhost:3000`.

### Docker Deployment

Refer to the `Dockerfile` for containerization details. Use the following commands to build and run your Docker container:

```bash
docker build -t nlp-services .
docker run -p 3000:3000 -e MONGODB_URI=<your-mongodb-connection-string> nlp-services
```

## Usage

This API provides endpoints to interact with the Google Cloud Natural Language API and AWS Comprehend. Example requests:

- **POST** `/api/analyze/google` for analyzing text with Google's NLP.
- **POST** `/api/analyze/aws` for analyzing text with AWS Comprehend.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
