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
