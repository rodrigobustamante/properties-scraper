export const extractDataFromInnerText = (innerText: string): object => {
  const innerTextSplitted = innerText.replace(/(\n)\1+/g, '$1').split('\n');
  const specs = innerTextSplitted[1].split('|');
  
  const data = {
    value: innerTextSplitted[0],
    size: specs[0].trim(),
    rooms: specs[1].trim(),
    bathrooms: specs[2].trim(),
    type: innerTextSplitted[2],
    description: innerTextSplitted[3],
  }

  return data;
}