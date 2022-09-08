export const DEFAULTS = {
  comment: "Managed by Terraform CDK",
  tags: undefined
};

export const SUBDOMAIN = process.env.SUBDOMAIN;
export const DOMAIN = process.env.DOMAIN;
export const WEBSITE_BUCKET_NAME = process.env.SUBDOMAN ? `${SUBDOMAIN}.${DOMAIN}` : DOMAIN; 