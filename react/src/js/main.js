// Main entry point bridge for the Personal AI Assistant React SPA
import { apiFetch } from "./utils/fetch.js";

// Import all module initializers (they each export an init function)
import * as dashboard from "./modules/dashboard.js";
import * as aiChat from "./modules/aiChat.js";
import * as voiceRecognition from "./modules/voiceRecognition.js";
import * as voiceResponse from "./modules/voiceResponse.js";
import * as speechRecognition from "./modules/speechRecognition.js";
import * as speechSynthesis from "./modules/speechSynthesis.js";
import * as typingAnimation from "./modules/typingAnimation.js";
import * as weather from "./modules/weather.js";
import * as news from "./modules/news.js";
import * as timeModule from "./modules/time.js";
import * as calendar from "./modules/calendar.js";
import * as reminder from "./modules/reminder.js";
import * as alarm from "./modules/alarm.js";
import * as clock from "./modules/clock.js";
import * as stopwatch from "./modules/stopwatch.js";
import * as timer from "./modules/timer.js";
import * as calculator from "./modules/calculator.js";
import * as scientificCalculator from "./modules/scientificCalculator.js";
import * as unitConverter from "./modules/unitConverter.js";
import * as currencyConverter from "./modules/currencyConverter.js";
import * as qrGenerator from "./modules/qrGenerator.js";
import * as barcodeGenerator from "./modules/barcodeGenerator.js";
import * as googleSearch from "./modules/googleSearch.js";
import * as wikipediaSearch from "./modules/wikipediaSearch.js";
import * as youtubeSearch from "./modules/youtubeSearch.js";
import * as translator from "./modules/translator.js";
import * as dictionary from "./modules/dictionary.js";
import * as ocr from "./modules/ocr.js";
import * as pdfReader from "./modules/pdfReader.js";
import * as imageGallery from "./modules/imageGallery.js";
import * as camera from "./modules/camera.js";
import * as screenshot from "./modules/screenshot.js";
import * as faceDetection from "./modules/faceDetection.js";
import * as faceRecognition from "./modules/faceRecognition.js";
import * as musicPlayer from "./modules/musicPlayer.js";
import * as videoPlayer from "./modules/videoPlayer.js";
import * as expenseTracker from "./modules/expenseTracker.js";
import * as todoList from "./modules/todoList.js";
import * as notes from "./modules/notes.js";
import * as chatBot from "./modules/chatBot.js";
import * as languageLearning from "./modules/languageLearning.js";
import * as healthTracker from "./modules/healthTracker.js";
import * as habitTracker from "./modules/habitTracker.js";
import * as budgetPlanner from "./modules/budgetPlanner.js";
import * as stockTracker from "./modules/stockTracker.js";
import * as newsAggregator from "./modules/newsAggregator.js";
import * as liveMap from "./modules/liveMap.js";

export const modulesMap = {
  dashboard,
  aiChat,
  voiceRecognition,
  voiceResponse,
  speechRecognition,
  speechSynthesis,
  typingAnimation,
  weather,
  news,
  timeModule,
  calendar,
  reminder,
  alarm,
  clock,
  stopwatch,
  timer,
  calculator,
  scientificCalculator,
  unitConverter,
  currencyConverter,
  qrGenerator,
  barcodeGenerator,
  googleSearch,
  wikipediaSearch,
  youtubeSearch,
  translator,
  dictionary,
  ocr,
  pdfReader,
  imageGallery,
  camera,
  screenshot,
  faceDetection,
  faceRecognition,
  musicPlayer,
  videoPlayer,
  expenseTracker,
  todoList,
  notes,
  chatBot,
  languageLearning,
  healthTracker,
  habitTracker,
  budgetPlanner,
  stockTracker,
  newsAggregator,
  liveMap
};

let reactNavigate = null;

export function registerReactNavigate(navFn) {
  reactNavigate = navFn;
}

export function navigateTo(targetId) {
  if (reactNavigate) {
    reactNavigate(targetId);
  } else {
    console.warn(`React navigate not registered. Cannot go to: ${targetId}`);
  }
}
