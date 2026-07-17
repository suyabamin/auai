// সরাসরি এপিআই কী সেট করার জন্য (যদি কোডেই বসাতে চান):
// NOTE: The API key has been removed for security. Use a placeholder or retrieve it from Script Properties.
const API_KEY = "YOUR_GEMINI_API_KEY_HERE";

// অথবা নিরাপদ উপায়ের জন্য (Script Properties ব্যবহার করলে নিচের লাইনটি আনকমেন্ট করুন):
// const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

/**
 * Google Apps Script backend dispatcher for Personal AI Assistant.
 * Expects POST requests with JSON body: { action: "actionName", payload: { ... } }
 */
function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    // Spread request parameters as payload
    const result = handleAction(action, request);
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function callGeminiWithRetry(prompt) {
  const modelName = "gemma-4-26b-a4b-it";
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + API_KEY;
  const fetchOptions = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    }),
    muteHttpExceptions: true
  };

  const MAX_RETRIES = 5;
  let lastError = "Unknown error.";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      Utilities.sleep(1500); // Wait 1.5s between retries
    }
    try {
      const response = UrlFetchApp.fetch(url, fetchOptions);
      const code = response.getResponseCode();
      const body = JSON.parse(response.getContentText());

      if (code === 200 && body.candidates && body.candidates[0].content && body.candidates[0].content.parts) {
        const parts = body.candidates[0].content.parts;
        const replyText = parts
          .filter(function(p) { return !p.thought; })
          .map(function(p) { return p.text; })
          .join("\n")
          .trim();
        return { status: "ok", reply: replyText || "No visible response text." };
      } else if (code === 500) {
        // Transient internal error — retry
        lastError = "Internal error encountered (attempt " + (attempt + 1) + ")";
        continue;
      } else {
        // Non-retryable error (e.g. 429 quota, 404 model not found)
        lastError = body.error ? body.error.message : response.getContentText();
        return { status: "error", reply: "Gemini API Error: " + lastError };
      }
    } catch(err) {
      lastError = err.message;
    }
  }

  return { status: "error", reply: "Gemini API failed after " + MAX_RETRIES + " attempts. Last error: " + lastError };
}

function handleAction(action, payload) {
  switch (action) {
    case "aiChat":
      const userPrompt = payload.prompt || "";
      return callGeminiWithRetry(userPrompt);

    case "chatMessage":
      return { status: "ok", reply: "This is a stub response from chatBot." };
    case "nextFlashcard":
      return { status: "ok", term: "Sample Term", definition: "Sample definition." };
    case "logHealth":
      return { status: "ok", message: "Health data logged." };
    case "logHabit":
      return { status: "ok", message: "Habit logged." };
    case "planBudget":
      return { status: "ok", budget: {} };
    case "trackStock":
      return { status: "ok", price: 123.45 };
    case "fetchNews":
      return { status: "ok", articles: [] };
    default:
      return { status: "ok", data: {} };
  }
}
