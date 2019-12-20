import $ from 'cheerio';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findDOMElement = (identifier: string, body: any): Cheerio => $(identifier, body);

export default findDOMElement;
