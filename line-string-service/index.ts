import { lineStringDataService } from "./lineStringService";

// Main function to run the service
async function main() {
  try {
    const lsService = new lineStringDataService();
    lsService.consumeAndUpdate()
    console.info('lineStringDataService working');

  } catch (error) {
    console.error('Service encountered an error:', error);
  } 
}

main();