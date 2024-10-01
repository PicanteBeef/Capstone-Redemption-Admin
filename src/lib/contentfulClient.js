import { createClient } from 'contentful';

const spaceId = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;
const managementToken = import.meta.env.VITE_CONTENTFUL_MANAGEMENT_TOKEN;

export const contentfulClient = createClient({
  space: spaceId,
  accessToken: accessToken,
  managementToken:managementToken 
});