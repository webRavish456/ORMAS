// Utility function to process India state-district-block data
// This transforms the raw JSON data into a format suitable for cascading dropdowns

interface RawDistrictData {
  name: string;
  code: string;
  stateCode: string;
  blockList: Array<{
    name: string;
    code: string;
  }>;
}

interface ProcessedData {
  [stateName: string]: {
    [districtName: string]: string[];
  };
}

// State code to state name mapping
const STATE_CODE_TO_NAME: { [key: string]: string } = {
  '1': 'Andhra Pradesh',
  '2': 'Assam',
  '3': 'Bihar',
  '4': 'Gujarat',
  '5': 'Haryana',
  '6': 'Himachal Pradesh',
  '7': 'Jammu and Kashmir',
  '8': 'Karnataka',
  '9': 'Kerala',
  '10': 'Madhya Pradesh',
  '11': 'Maharashtra',
  '12': 'Manipur',
  '13': 'Meghalaya',
  '14': 'Mizoram',
  '15': 'Odisha',
  '16': 'Punjab',
  '17': 'Rajasthan',
  '18': 'Tamil Nadu',
  '19': 'Tripura',
  '20': 'Uttar Pradesh',
  '21': 'West Bengal',
  '22': 'Sikkim',
  '23': 'Chhattisgarh',
  '24': 'Jharkhand',
  '25': 'Uttarakhand',
  '26': 'Telangana',
  '27': 'Goa',
  '28': 'Puducherry',
  '29': 'Dadra and Nagar Haveli and Daman and Diu',
  '30': 'Ladakh',
  '31': 'Andaman and Nicobar Islands',
  '32': 'Arunachal Pradesh',
  '33': 'Chandigarh',
  '34': 'Dadra and Nagar Haveli and Daman and Diu',
  '35': 'Delhi',
  '36': 'Lakshadweep'
};

export function processIndiaData(rawData: RawDistrictData[]): ProcessedData {
  const processedData: ProcessedData = {};

  rawData.forEach(district => {
    const stateName = STATE_CODE_TO_NAME[district.stateCode];

    if (!stateName) {
      console.warn(`Unknown state code: ${district.stateCode}`);
      return;
    }

    if (!processedData[stateName]) {
      processedData[stateName] = {};
    }

    // Extract block names from blockList
    const blockNames = district.blockList.map(block => block.name);
    processedData[stateName][district.name] = blockNames;
  });

  return processedData;
}

// Function to get all states
export function getStates(processedData: ProcessedData): string[] {
  return Object.keys(processedData).sort();
}

// Function to get districts for a state
export function getDistricts(processedData: ProcessedData, stateName: string): string[] {
  if (!processedData[stateName]) return [];
  return Object.keys(processedData[stateName]).sort();
}

// Function to get blocks for a district
export function getBlocks(processedData: ProcessedData, stateName: string, districtName: string): string[] {
  if (!processedData[stateName] || !processedData[stateName][districtName]) return [];
  return processedData[stateName][districtName].sort();
} 