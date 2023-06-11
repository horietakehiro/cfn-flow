
import typing
import urllib.parse
from logging import INFO
from os import name
from typing import List, Literal, Optional, TypedDict

import boto3
import utils
from aws_xray_sdk.core import patch_all, xray_recorder
from utilities_common import GET_CORS_HEADERS, Response

ResourceType = Literal[
    "AWS::EC2::AvailabilityZone::Name" , "List<AWS::EC2::AvailabilityZone::Name>",
    # "AWS::EC2::Image::Id", "List<AWS::EC2::Image::Id>",
    "AWS::EC2::Instance::Id", "List<AWS::EC2::Instance::Id>",
    "AWS::EC2::KeyPair::KeyName",
    "AWS::EC2::SecurityGroup::GroupName", "List<AWS::EC2::SecurityGroup::GroupName>",
    "AWS::EC2::SecurityGroup::Id", "List<AWS::EC2::SecurityGroup::Id>",
    "AWS::EC2::Subnet::Id", "List<AWS::EC2::Subnet::Id>",
    "AWS::EC2::Volume::Id", "List<AWS::EC2::Volume::Id>",
    "AWS::EC2::VPC::Id", "List<AWS::EC2::VPC::Id>",
    "AWS::Route53::HostedZone::Id", "List<AWS::Route53::HostedZone::Id>",

    # "AWS::SSM::Parameter::Name",
    # "AWS::SSM::Parameter::Value<String>",
    # "AWS::SSM::Parameter::Value<List<String>>", "AWS::SSM::Parameter::Value<CommaDelimitedList>",
    # "AWS::SSM::Parameter::Value<AWS::EC2::AvailabilityZone::Name>", "AWS::SSM::Parameter::Value<List<AWS::EC2::AvailabilityZone::Name>>",
    # "AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>", "AWS::SSM::Parameter::Value<List<AWS::EC2::Image::Id>>",
    # "AWS::SSM::Parameter::Value<AWS::EC2::Instance::Id>", "AWS::SSM::Parameter::Value<List<AWS::EC2::Instance::Id>>",
    # "AWS::SSM::Parameter::Value<AWS::EC2::KeyPair::KeyName>", "AWS::SSM::Parameter::Value<List<AWS::EC2::KeyPair::KeyName>>",
    # "AWS::SSM::Parameter::Value<AWS::EC2::SecurityGroup::GroupName>", "AWS::SSM::Parameter::Value<List<AWS::EC2::SecurityGroup::GroupName>>",
    # "AWS::SSM::Parameter::Value<AWS::EC2::SecurityGroup::Id>", "AWS::SSM::Parameter::Value<List<AWS::EC2::SecurityGroup::Id>>",
    # "AWS::SSM::Parameter::Value<AWS::EC2::Subnet::Id>","AWS::SSM::Parameter::Value<List<AWS::EC2::Subnet::Id>>",
    # "AWS::SSM::Parameter::Value<AWS::EC2::Volume::Id>", "AWS::SSM::Parameter::Value<List<AWS::EC2::Volume::Id>>",
    # "AWS::SSM::Parameter::Value<AWS::EC2::VPC::Id>", "AWS::SSM::Parameter::Value<List<AWS::EC2::VPC::Id>>",
    # "AWS::SSM::Parameter::Value<AWS::Route53::HostedZone::Id>", "AWS::SSM::Parameter::Value<List<AWS::Route53::HostedZone::Id>>",

]
class ListSecurityGroupNamesResponseBody(TypedDict):
    securityGroupNames: Optional[List[str]]
    error: Optional[str]

class RequestPathParams(TypedDict):
    regionName: str
    resourceType: ResourceType

class ListAvailabilityZonesResponseBody(TypedDict):
    availabilityZones: Optional[List[str]]
    error: Optional[str]
class InstanceDetail(TypedDict):
    id: str
    name: Optional[str]
class ListInstanceDetailsResponseBody(TypedDict):
    instanceDetails: Optional[List[InstanceDetail]]
    error: Optional[str]

class ListKeyNamesResponseBody(TypedDict):
    keyNames: Optional[List[str]]
    error: Optional[str]

class SecurityGroupDetails(TypedDict):
    id: str
    name: str
class ListSecurityGroupDetailsResponseBody(TypedDict):
    securityGroupDetails: Optional[List[SecurityGroupDetails]]
    error: Optional[str]

class SubnetDetail(TypedDict):
    id: str
    name: Optional[str]
    vpcId: str
    availabilityZone: str
    cidrBlock: str
class ListSubnetDetailsResponseBody(TypedDict):
    subnetDetails: Optional[List[SubnetDetail]]
    error: Optional[str]
class VpcDetail(TypedDict):
    id: str
    name: Optional[str]
    cidrBlock: str
class ListVpcDetailsResponseBody(TypedDict):
    vpcDetails: Optional[List[VpcDetail]]
    error: Optional[str]

class VolumeDetail(TypedDict):
    id: str
    name: Optional[str]
class ListVolumeDetailsResponseBody(TypedDict):
    volumeDetails: Optional[List[VolumeDetail]]
    error: Optional[str]

class HostedZoneDetail(TypedDict):
    id: str
    name: str
class ListHostedZoneDetailsResponseBody(TypedDict):
    hostedZoneDetails: Optional[List[HostedZoneDetail]]
    error: Optional[str]


get_logger = utils.logger_manager()
logger = get_logger(__name__, INFO)

patch_all()

def list_availability_zones(region_name:str) -> List[str]:
    availability_zones:List[str] = []
    client = boto3.client("ec2", region_name=region_name)
    
    res = client.describe_availability_zones(
        Filters=[
            {"Name": "state", "Values": ["available"]}
        ]
    )
    logger.info(utils.jdumps(dict(res)))
    for az in res["AvailabilityZones"]:
        zone_name = az.get("ZoneName")
        if zone_name is None:
            continue
        availability_zones.append(zone_name)
    return availability_zones


def list_instance_details(region_name:str) -> List[InstanceDetail]:
    instance_details:List[InstanceDetail] = []
    client = boto3.client("ec2", region_name=region_name)

    res = client.describe_instances(
        Filters=[
            {
                "Name": "instance-state-name",
                "Values": [
                    "pending", "running", "stopping", "stopped",
                ]
            }
        ]
    )
    logger.info(utils.jdumps(dict(res)))

    for reservation in res["Reservations"]:
        for instance in reservation["Instances"]: # type: ignore
            tags = instance.get("Tags")
            if tags is None:
                continue
            for tag in tags:
                if tag["Key"] == "Name": # type: ignore
                    instance_details.append({
                        "id": instance["InstanceId"], "name": tag["Value"] # type: ignore
                    }) # type: ignore
                    break
                else:
                    pass
            else:
                instance_details.append({
                    "id": instance["InstanceId"], "name": None, # type:ignore
                })

    return instance_details


def list_key_names(region_name:str) -> List[str]:
    key_names:List[str] = []
    client = boto3.client("ec2", region_name=region_name)

    res = client.describe_key_pairs()
    logger.info(utils.jdumps(dict(res)))

    for keypair in res["KeyPairs"]:
        key_names.append(keypair["KeyName"]) # type: ignore

    return key_names

def list_security_group_details(region_name:str) -> List[SecurityGroupDetails]:
    security_group_details:List[SecurityGroupDetails] = []
    client = boto3.client("ec2", region_name=region_name)

    res = client.describe_security_groups()
    logger.info(utils.jdumps(dict(res)))

    for security_group in res["SecurityGroups"]:
        security_group_details.append({
            "id": security_group["GroupId"], # type: ignore
            "name": security_group["GroupName"], # type: ignore
        })
    return security_group_details

def list_security_group_names(region_name:str) -> List[str]:
    security_group_names:List[str] = []
    client = boto3.client("ec2", region_name=region_name)

    res = client.describe_security_groups()
    logger.info(utils.jdumps(dict(res)))

    for security_group in res["SecurityGroups"]:
        security_group_names.append(security_group["GroupName"]) # type: ignore
    return security_group_names

def list_subnet_details(region_name:str) -> List[SubnetDetail]:
    subnet_details:List[SubnetDetail] = []
    client = boto3.client("ec2", region_name=region_name)

    res = client.describe_subnets()
    logger.info(utils.jdumps(dict(res)))

    for subnet in res["Subnets"]:
        tags = subnet.get("Tags")
        if tags is None:
            continue
        for tag in tags:
            if tag["Key"] == "Name": # type: ignore
                subnet_details.append({
                    "id": subnet["SubnetId"], # type: ignore
                    "name": tag["Value"], # type: ignore
                    "vpcId": subnet["VpcId"], # type: ignore
                    "availabilityZone": subnet["AvailabilityZone"], # type: ignore
                    "cidrBlock": subnet["CidrBlock"], # type: ignore
                })
                break
        else:
            subnet_details.append({
                "id": subnet["SubnetId"], # type: ignore
                "name": None,
                "vpcId": subnet["VpcId"], # type: ignore
                "availabilityZone": subnet["AvailabilityZone"], # type: ignore
                "cidrBlock": subnet["CidrBlock"], # type: ignore
            })

    return subnet_details

def list_vpc_details(region_name:str) -> List[VpcDetail]:
    vpc_details:List[VpcDetail] = []
    client = boto3.client("ec2", region_name=region_name)

    res = client.describe_vpcs()
    logger.info(utils.jdumps(dict(res)))

    for vpc in res["Vpcs"]:
        tags = vpc.get("Tags")
        if tags is None:
            continue
        for tag in tags:
            if tag["Key"] == "Name": # type: ignore
                vpc_details.append({
                    "id": vpc["VpcId"], # type: ignore
                    "name": tag["Value"], # type: ignore
                    "cidrBlock": vpc["CidrBlock"], # type: ignore
                })
                break
        else:
            vpc_details.append({
                "id": vpc["VpcId"], # type: ignore
                "name": None,
                "cidrBlock": vpc["CidrBlock"], # type: ignore
            })
    return vpc_details


def list_volume_details(region_name:str) -> List[VolumeDetail]:
    volume_details:List[VolumeDetail] = []
    client = boto3.client("ec2", region_name=region_name)

    res = client.describe_volumes()
    logger.info(utils.jdumps(dict(res)))

    for volume in res["Volumes"]:
        tags = volume.get("Tags")
        if tags is None:
            continue
        for tag in tags:
            if tag["Key"] == "Name": # type: ignore
                volume_details.append({
                    "id": volume["VolumeId"],  # type: ignore
                    "name": tag["Value"], # type: ignore
                })
                break
        else:
            volume_details.append({
                "id": volume["VolumeId"],  # type: ignore
                "name": None,
            })
    return volume_details

def list_hosted_zone_details(region_name:str) -> List[HostedZoneDetail]:
    hosted_zone_details:List[HostedZoneDetail] = []
    client = boto3.client("route53")

    res = client.list_hosted_zones()
    for hosted_zone in res["HostedZones"]:
        hosted_zone_details.append({
            "id": hosted_zone["Id"].replace("/hostedzone/", ""),
            "name": hosted_zone["Name"],
        })
    return hosted_zone_details


def validate_path_params(region_name:str, resource_type:ResourceType):
    if region_name == "":
        raise ValueError("regionName must be specified")
    if resource_type not in typing.get_args(ResourceType):
        raise ValueError(f"unsupported resourceType : {resource_type}")

def lambda_handler(event:dict, context) -> Response:

    logger.info(utils.jdumps(event))

    # get region name and resource type from path params
    try:
        params:RequestPathParams = event.get("pathParameters", None)
        region_name = params.get("regionName", "") if params is not None else ""
        resource_type = params.get("resourceType", "") if params is not None else "" # type: ignore
        resource_type:ResourceType = urllib.parse.unquote(resource_type) # type: ignore

        validate_path_params(region_name, resource_type) # type: ignore
    except Exception as ex:
        msg = "invalid path parameters : "
        logger.error(msg, exc_info=True)
        return {
            "statusCode": 400,
            "headers": GET_CORS_HEADERS,
            "body": utils.jdumps(dict({"error": msg + str(ex)})),
        }
    
    # get resources by resource types
    try:
        body = ""
        if resource_type == "AWS::EC2::AvailabilityZone::Name" or resource_type == "List<AWS::EC2::AvailabilityZone::Name>":
            resources = list_availability_zones(region_name)
            body = utils.jdumps(dict(ListAvailabilityZonesResponseBody(
                error=None, availabilityZones=resources
            )))
        if resource_type == "AWS::EC2::Instance::Id" or resource_type == "List<AWS::EC2::Instance::Id>":
            resources = list_instance_details(region_name)
            body = utils.jdumps(dict(ListInstanceDetailsResponseBody(
                error=None, instanceDetails=resources
            )))
        if resource_type == "AWS::EC2::KeyPair::KeyName":
            resources = list_key_names(region_name)
            body = utils.jdumps(dict(ListKeyNamesResponseBody(
                error=None, keyNames=resources
            )))
        if resource_type == "AWS::EC2::SecurityGroup::GroupName" or resource_type == "List<AWS::EC2::SecurityGroup::GroupName>":
            resources = list_security_group_names(region_name)
            body = utils.jdumps(dict(ListSecurityGroupNamesResponseBody(
                error=None, securityGroupNames=resources
            )))
        if resource_type == "AWS::EC2::SecurityGroup::Id" or resource_type == "List<AWS::EC2::SecurityGroup::Id>":
            resources = list_security_group_details(region_name)
            body = utils.jdumps(dict(ListSecurityGroupDetailsResponseBody(
                error=None, securityGroupDetails=resources,
            )))
        if resource_type == "AWS::EC2::Subnet::Id" or resource_type == "List<AWS::EC2::Subnet::Id>":
            resources = list_subnet_details(region_name)
            body = utils.jdumps(dict(ListSubnetDetailsResponseBody(
                error=None, subnetDetails=resources,
            )))
        if resource_type == "AWS::EC2::VPC::Id" or resource_type == "List<AWS::EC2::VPC::Id>":
            resources = list_vpc_details(region_name)
            body = utils.jdumps(dict(ListVpcDetailsResponseBody(
                error=None, vpcDetails=resources,
            )))
        if resource_type == "AWS::EC2::Volume::Id" or resource_type == "List<AWS::EC2::Volume::Id>":
            resources = list_volume_details(region_name)
            body = utils.jdumps(dict(ListVolumeDetailsResponseBody(
                error=None, volumeDetails=resources,
            )))

        if resource_type == "AWS::Route53::HostedZone::Id" or resource_type == "List<AWS::Route53::HostedZone::Id>":
            resources = list_hosted_zone_details(region_name)
            body = utils.jdumps(dict(ListHostedZoneDetailsResponseBody(
                error=None, hostedZoneDetails=resources,
            )))

        return {
            "statusCode": 200,
            "headers": GET_CORS_HEADERS,
            "body": body,
        }
            
    except Exception as ex:
        msg = f"failed to list resources for {resource_type} on {region_name}"
        logger.error(msg, exc_info=True)
        return {
            "statusCode": 500,
            "headers": GET_CORS_HEADERS,
            "body": utils.jdumps(dict({"error": msg + str(ex)})),
        }
    

