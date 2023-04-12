import { Auth, Storage } from "aws-amplify"
import AmplifyConfig from "../AmplifyConfig"

export const getApiAuth = async () => {
    return `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
}

export const uploadObj = async (
    s3Filename: string, fileObj: File,
    accessLevel: "public" | "private" | "protected"
): Promise<UploadObjResponse> => {
    const result = await Storage.put(s3Filename, fileObj, { level: accessLevel })
    const httpUrl = `https://${AmplifyConfig.aws_user_files_s3_bucket}.s3.${AmplifyConfig.aws_user_files_s3_bucket_region}.amazonaws.com/${accessLevel}/${result.key}`
    return {
        httpUrl: httpUrl,
        key: result.key
    }
}

export const downloadObj = async (
    s3Filename: string,
    accessLevel: "public" | "private" | "protected",
    contentType = "*/*"
) => {
    const result = await Storage.get(s3Filename, {
        level: accessLevel, download: true, contentType,
    })

    console.log(await (result.Body as Blob).text())

    return (result.Body as Blob).text()
}

export const parseS3HttpUrl = (httpUrl:string) => {
    const url = new URL(httpUrl)
    const s3BucketName = url.hostname.split(".s3.")[0]
    const s3FullKey = url.pathname
    const accessLevelRegex = s3FullKey.match(/^\/[^/]*\//)
    const accessLevelKey = accessLevelRegex ? accessLevelRegex[0] : "/public/"
    const accessLevel = accessLevelKey.replace("/", "")
    const s3PartialKey = s3FullKey.replace(accessLevelKey, "")
    const baseObjname = s3FullKey.split("/")[s3FullKey.split("/").length-1]

    return {
        s3BucketName, s3FullKey, s3PartialKey, accessLevel, baseObjname,
    }

  }


export const getRegions = () => {
    return [
        "ap-south-1",
        "eu-north-1",
        "eu-west-3",
        "eu-west-2",
        "eu-west-1",
        "ap-northeast-3",
        "ap-northeast-2",
        "ap-northeast-1",
        "ca-central-1",
        "sa-east-1",
        "ap-southeast-1",
        "ap-southeast-2",
        "eu-central-1",
        "us-east-1",
        "us-east-2",
        "us-west-1",
        "us-west-2",
    ]
}