import axios from 'axios';
import { cities, city, enlishNameByCity } from './cities';
import { omit } from './utils';
import fs from 'fs';
import path from 'path';
export interface Street extends Omit<ApiStreet, '_id'>{
	street_id: number
}

interface ApiStreet{
	_id: number
	region_code: number
	region_name: string
	city_code: number
	city_name: string
	street_code: number
	street_name: string
	street_name_status: string
	official_code: number
}


export class StreetsService{

	static async getStreetsInCity(city: city): Promise<{city: city, streets: {
  street_id: number;
  street_name: string;
  street_english_name: string;
  street_hebrew_name: string;
  region_name: string;
  city_name: string;
}[]}>{
		const res = (await axios.post('https://data.gov.il/api/3/action/datastore_search', {resource_id:`1b14e41c-85b3-4c21-bdce-9fe48185ffca`, filters: {city_name: cities[city]}, limit: 100000})).data as {
			result: { records: ApiStreet[] }
		  };
		const results = res.result.records
		if (!results || !results.length) {
			throw new Error('No streets found for city: ' + city)
		}
		// get streets english name of street from streets.json file in current directory .
		const streetsJsonPath = path.join(__dirname, 'streets.json');
		const streetsJsonRaw = fs.readFileSync(streetsJsonPath, 'utf-8');
		const streetsJson = JSON.parse(streetsJsonRaw);
		const cityKey = city.toLowerCase();
		const englishNameByHebrew: Record<string, string> = {};
		if (streetsJson[cityKey] && Array.isArray(streetsJson[cityKey].elements)) {
			for (const el of streetsJson[cityKey].elements) {
				if (el.tags && el.tags.name && el.tags['name:en']) {
					englishNameByHebrew[el.tags.name] = el.tags['name:en'];
				}
			}
		}
		const streets = results.map((street: ApiStreet) => {
			const enName = englishNameByHebrew[street.street_name.trim()] || '';
			return {
				street_id: street._id,
				street_name: street.street_name.trim(),
				street_english_name: enName,
				street_hebrew_name: street.street_name.trim(),
				region_name: street.region_name.trim(),
				city_name: enlishNameByCity[street.city_name]
			}
		})
	
		return {city, streets}
	}

	static async getStreetInfoById(id: number){
		const res:any = (await axios.post('https://data.gov.il/api/3/action/datastore_search', {resource_id:`1b14e41c-85b3-4c21-bdce-9fe48185ffca`, filters: {_id: id}, limit: 1})).data

		const results = res.result.records
		if (!results || !results.length) {
			throw new Error('No street found for id: ' + id)
		}
		const dbStreet: ApiStreet = results[0]
		const cityName = enlishNameByCity[dbStreet.city_name]
		const street:any  = {...omit<ApiStreet>(dbStreet, '_id'), street_id: dbStreet._id, city_name: cityName, region_name: dbStreet.region_name.trim(), street_name: dbStreet.street_name.trim()}
		return street
	}
}