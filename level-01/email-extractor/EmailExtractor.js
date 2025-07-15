const EmailExtractor = require("./email-extractor");

async function extractEmails() {
  const extractor = new EmailExtractor({
    recursive: true,
    verbose: true,
  });

  const emails = await extractor.extractFromPath("./path/to/scan");
  console.log("Found emails:", emails);
}

extractEmails();
