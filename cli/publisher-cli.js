import { Command } from 'commander';
import axios from 'axios';
const program = new Command();
program
    .name('publisher-cli')
    .description('CLI for publishing streets data')
    .argument('<city>', 'City name to fetch streets data for')
    .action(async (city) => {
    try {
        const response = await axios.post('http://localhost:3000/publish', { city });
        console.log(response.data.message);
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error:', error.response?.data.error || error.response?.data.message);
        }
        else {
            console.error('Error:', error);
        }
    }
});
program.parse(process.argv);
