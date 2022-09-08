
import { Construct } from "constructs";
import { DataAwsAcmCertificate } from "@cdktf/provider-aws/lib/acm";
import { CloudfrontDistribution, CloudfrontDistributionConfig, CloudfrontDistributionCustomErrorResponse, CloudfrontDistributionDefaultCacheBehavior, CloudfrontDistributionDefaultCacheBehaviorForwardedValues, CloudfrontDistributionDefaultCacheBehaviorForwardedValuesCookies, CloudfrontDistributionOrigin, CloudfrontDistributionOriginCustomOriginConfig, CloudfrontDistributionOriginS3OriginConfig, CloudfrontDistributionRestrictions, CloudfrontDistributionRestrictionsGeoRestriction, CloudfrontDistributionViewerCertificate, CloudfrontOriginAccessIdentity, CloudfrontOriginAccessIdentityConfig } from "@cdktf/provider-aws/lib/cloudfront";
import { S3Bucket } from "@cdktf/provider-aws/lib/s3";
import { DEFAULTS, WEBSITE_BUCKET_NAME } from "@/config";

export const buildCloudfrontOAI = (scope: Construct) => {
  return new CloudfrontOriginAccessIdentity(scope, `${WEBSITE_BUCKET_NAME}-oai`, <CloudfrontOriginAccessIdentityConfig>{
    comment: WEBSITE_BUCKET_NAME
  });
};

export const buildWebsiteCloudfrontDistribution = (
  scope: Construct,
  certificate: DataAwsAcmCertificate,
  bucket: S3Bucket,
  oai: CloudfrontOriginAccessIdentity
): CloudfrontDistribution => {
  return new CloudfrontDistribution(scope, `website-${WEBSITE_BUCKET_NAME}-cloudfront-distribution`,
    <CloudfrontDistributionConfig>{
      comment: DEFAULTS.comment,
      tags: DEFAULTS.tags,
      priceClass: "PriceClass_100",
      enabled: true,
      isIpv6Enabled: true,
      defaultRootObject: "index.html",
      aliases: [WEBSITE_BUCKET_NAME],
      customErrorResponse: [
        <CloudfrontDistributionCustomErrorResponse>{
          errorCode: 403,
          responseCode: 200,
          responsePagePath: "/"
        },
        <CloudfrontDistributionCustomErrorResponse>{
          errorCode: 404,
          responseCode: 200,
          responsePagePath: "/"
        }
      ],
      origin: [
        <CloudfrontDistributionOrigin>{
          originId: bucket.id,
          domainName: bucket.bucketRegionalDomainName,
          s3OriginConfig: <CloudfrontDistributionOriginS3OriginConfig>{
            originAccessIdentity: oai.cloudfrontAccessIdentityPath
          }
        }
      ],
      defaultCacheBehavior: <CloudfrontDistributionDefaultCacheBehavior>{
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],
        targetOriginId: bucket.id,
        forwardedValues: <CloudfrontDistributionDefaultCacheBehaviorForwardedValues>{
          queryString: true,
          cookies: <CloudfrontDistributionDefaultCacheBehaviorForwardedValuesCookies>{
            forward: "all"
          }
        },
        viewerProtocolPolicy: "redirect-to-https",
        defaultTtl: 2592000,
        maxTtl: 31536000,
        minTtl: 0
      },
      restrictions: <CloudfrontDistributionRestrictions>{
        geoRestriction: <CloudfrontDistributionRestrictionsGeoRestriction>{
          restrictionType: "none"
        }
      },
      viewerCertificate: <CloudfrontDistributionViewerCertificate>{
        acmCertificateArn: certificate.arn,
        sslSupportMethod: "sni-only"
      }
    });
};