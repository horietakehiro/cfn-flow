import importlib
import json
import os
from collections import OrderedDict
from time import sleep
from typing import Any
from unittest import mock
from unittest.mock import Mock

import boto3
import list_parameter_resources
import pytest
import utils
from boto3.dynamodb.conditions import Key
from list_parameter_resources import *

TEST_REGION_NAME="ap-northeast-1"

def teardown_function(function):
    importlib.reload(list_parameter_resources.boto3)
    importlib.reload(boto3)

def setup_module(module):
    pass

def teardown_module(module):
    pass


def test_validate_path_params_valid():
    res = validate_path_params(TEST_REGION_NAME, "AWS::EC2::AvailabilityZone::Name")
    assert res is None

def test_validate_path_params_invalid():
    with pytest.raises(ValueError) as ex:
        validate_path_params("", "AWS::EC2::AvailabilityZone::Name")
        assert "regionName" in str(ex)
    with pytest.raises(ValueError) as ex:
        validate_path_params(TEST_REGION_NAME, "AWS::UNSUPPORTED::Resource") # type:ignore
        assert "resourceType" in str(ex)


@pytest.mark.parametrize("resource_type", [
    ("AWS::EC2::AvailabilityZone::Name"), ("List<AWS::EC2::AvailabilityZone::Name>"),
])
def test_lambda_handler_list_availability_zones(resource_type):
    params:RequestPathParams = {
        "regionName": TEST_REGION_NAME,
        "resourceType": resource_type
    }
    event = {"pathParameters": params}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ListAvailabilityZonesResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["availabilityZones"] is not None
    assert len(ret_body["availabilityZones"]) > 2

@pytest.mark.parametrize("resource_type", [
    ("AWS::EC2::Instance::Id"), ("List<AWS::EC2::Instance::Id>"),
])
def test_lambda_handler_list_instance_details(resource_type):

    mock_describe_instances = Mock(return_value={
        "Reservations": [
            {
                "Instances": [
                    {
                        "InstanceId": "id-with-name",
                        "Tags": [
                            {"Key": "key1", "Value": "value1"},
                            {"Key": "Name", "Value": "name-tag"},
                        ]
                    },
                    {
                        "InstanceId": "id-without-name",
                        "Tags": [
                        ]
                    },
                ]
            }
        ]
    })
    mock_ec2_client = Mock(describe_instances=mock_describe_instances)
    mock_client = Mock(return_value=mock_ec2_client)
    list_parameter_resources.boto3.client = mock_client

    params:RequestPathParams = {
        "regionName": TEST_REGION_NAME,
        "resourceType": resource_type,
    }
    event = {"pathParameters": params}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ListInstanceDetailsResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["instanceDetails"] is not None
    assert len(ret_body["instanceDetails"]) == 2

@pytest.mark.parametrize("resource_type", [
    ("AWS::EC2::KeyPair::KeyName"),
])
def test_lambda_handler_list_key_names(resource_type):

    mock_describe_key_pairs = Mock(return_value={
        'KeyPairs': [
            {
                'KeyName': 'key1',
            },
            {
                'KeyName': 'key2',
            },

        ]
    })
    mock_ec2_client = Mock(describe_key_pairs=mock_describe_key_pairs)
    mock_client = Mock(return_value=mock_ec2_client)
    list_parameter_resources.boto3.client = mock_client

    params:RequestPathParams = {
        "regionName": TEST_REGION_NAME,
        "resourceType": resource_type,
    }
    event = {"pathParameters": params}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ListKeyNamesResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["keyNames"] is not None
    assert ret_body["keyNames"][0] == "key1" and ret_body["keyNames"][1] == "key2"


@pytest.mark.parametrize("resource_type", [
    ("AWS::EC2::SecurityGroup::GroupName"), ("List<AWS::EC2::SecurityGroup::GroupName>")
])
def test_lambda_handler_list_security_group_names(resource_type):

    params:RequestPathParams = {
        "regionName": TEST_REGION_NAME,
        "resourceType": resource_type,
    }
    event = {"pathParameters": params}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ListSecurityGroupNamesResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["securityGroupNames"] is not None
    assert "default" in ret_body["securityGroupNames"]

@pytest.mark.parametrize("resource_type", [
    ("AWS::EC2::SecurityGroup::Id"), ("List<AWS::EC2::SecurityGroup::Id>")
])
def test_lambda_handler_list_security_group_details(resource_type):

    params:RequestPathParams = {
        "regionName": TEST_REGION_NAME,
        "resourceType": resource_type,
    }
    event = {"pathParameters": params}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ListSecurityGroupDetailsResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["securityGroupDetails"] is not None
    default_security_group = [sg for sg in ret_body["securityGroupDetails"] if sg["name"] == "default"]
    assert len(default_security_group) > 0
    assert default_security_group[0]["id"].startswith("sg-")

@pytest.mark.parametrize("resource_type", [
    ("AWS::EC2::Subnet::Id"), ("List<AWS::EC2::Subnet::Id>")
])
def test_lambda_handler_list_subnet_details(resource_type):
    
    mock_describe_subnets = Mock(return_value={
        'Subnets': [
            {
                'AvailabilityZone': f'{TEST_REGION_NAME}a',
                'CidrBlock': '10.0.0.0/24',
                'SubnetId': 'subnet-with-name',
                'VpcId': 'vpc',
                'Tags': [
                    {
                        'Key': 'key1',
                        'Value': 'val1'
                    },
                    {
                        'Key': 'Name',
                        'Value': 'name-tag'
                    },
                ],
            },
            {
                'AvailabilityZone': f'{TEST_REGION_NAME}b',
                'CidrBlock': '20.0.0.0/24',
                'SubnetId': 'subnet-without-name',
                'VpcId': 'vpc',
                'Tags': [
                    {
                        'Key': 'key1',
                        'Value': 'val1'
                    },
                ],
            },
        ],
    })
    mock_ec2_client = Mock(describe_subnets=mock_describe_subnets)
    mock_client = Mock(return_value=mock_ec2_client)
    list_parameter_resources.boto3.client = mock_client

    params:RequestPathParams = {
        "regionName": TEST_REGION_NAME,
        "resourceType": resource_type,
    }
    event = {"pathParameters": params}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ListSubnetDetailsResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["subnetDetails"] is not None
    assert len(ret_body["subnetDetails"]) == 2
    s1 = ret_body["subnetDetails"][0]
    s2 = ret_body["subnetDetails"][1]
    assert s1["id"] == "subnet-with-name"
    assert s1["availabilityZone"] == f"{TEST_REGION_NAME}a"
    assert s1["vpcId"] == "vpc"
    assert s1["cidrBlock"] == "10.0.0.0/24"
    assert s1["name"] == "name-tag"
    assert s2["name"] is None

@pytest.mark.parametrize("resource_type", [
    ("AWS::EC2::VPC::Id"), ("List<AWS::EC2::VPC::Id>")
])
def test_lambda_handler_list_vpc_details(resource_type):

    mock_describe_vpcs = Mock(return_value={
        'Vpcs': [
            {
                'CidrBlock': '10.0.0.0/16',
                'VpcId': 'vpc-with-name',
                'Tags': [
                    {
                        'Key': 'key1',
                        'Value': 'val1'
                    },
                    {
                        'Key': 'Name',
                        'Value': 'name-tag'
                    },
                ],
            },
            {
                'CidrBlock': '20.0.0.0/16',
                'VpcId': 'vpc-without-name',
                'Tags': [
                    {
                        'Key': 'key1',
                        'Value': 'val1'
                    },
                ],
            },
        ],
    })
    mock_ec2_client = Mock(describe_vpcs=mock_describe_vpcs)
    mock_client = Mock(return_value=mock_ec2_client)
    list_parameter_resources.boto3.client = mock_client

    params:RequestPathParams = {
        "regionName": TEST_REGION_NAME,
        "resourceType": resource_type,
    }
    event = {"pathParameters": params}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ListVpcDetailsResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["vpcDetails"] is not None
    assert len(ret_body["vpcDetails"]) == 2
    v1 = ret_body["vpcDetails"][0]
    v2 = ret_body["vpcDetails"][1]
    assert v1["id"] == "vpc-with-name"
    assert v1["cidrBlock"] == "10.0.0.0/16"
    assert v1["name"] == "name-tag"
    assert v2["name"] is None


@pytest.mark.parametrize("resource_type", [
    ("AWS::EC2::Volume::Id"), ("List<AWS::EC2::Volume::Id>")
])
def test_lambda_handler_list_volume_details(resource_type):

    mock_describe_volumes = Mock(return_value={
        'Volumes': [
            {
                'VolumeId': 'volume-without-name',
                'Tags': [
                ],
            },
            {
                'VolumeId': 'volume-with-name',
                'Tags': [
                    {
                        'Key': 'Name',
                        'Value': 'name-tag'
                    },
                    {
                        'Key': 'key1',
                        'Value': 'val1'
                    },
                ],
            },
        ],
    })
    mock_ec2_client = Mock(describe_volumes=mock_describe_volumes)
    mock_client = Mock(return_value=mock_ec2_client)
    list_parameter_resources.boto3.client = mock_client

    params:RequestPathParams = {
        "regionName": TEST_REGION_NAME,
        "resourceType": resource_type,
    }
    event = {"pathParameters": params}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ListVolumeDetailsResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["volumeDetails"] is not None
    assert len(ret_body["volumeDetails"]) == 2
    v1 = ret_body["volumeDetails"][0]
    v2 = ret_body["volumeDetails"][1]
    assert v1["id"] == "volume-without-name"
    assert v1["name"] is None
    assert v2["name"] == "name-tag"



@pytest.mark.parametrize("resource_type", [
    ("AWS::Route53::HostedZone::Id"), ("List<AWS::Route53::HostedZone::Id>")
])
def test_lambda_handler_list_hosted_zone_details(resource_type):

    mock_list_hosted_zones = Mock(return_value={
        'HostedZones': [
            {
                'Id': 'zone-id-1',
                'Name': 'zone-name-1',
            },
            {
                'Id': 'zone-id-2',
                'Name': 'zone-name-2',
            },
        ],
    })
    mock_route53_client = Mock(list_hosted_zones=mock_list_hosted_zones)
    mock_client = Mock(return_value=mock_route53_client)
    list_parameter_resources.boto3.client = mock_client

    params:RequestPathParams = {
        "regionName": TEST_REGION_NAME,
        "resourceType": resource_type,
    }
    event = {"pathParameters": params}

    response = lambda_handler(event, None)

    assert response["statusCode"] == 200
    ret_body:ListHostedZoneDetailsResponseBody = json.loads(response["body"])
    assert ret_body["error"] is None
    assert ret_body["hostedZoneDetails"] is not None
    assert len(ret_body["hostedZoneDetails"]) == 2
    h1 = ret_body["hostedZoneDetails"][0]
    h2 = ret_body["hostedZoneDetails"][1]
    assert h1["id"] == "zone-id-1"
    assert h1["name"] == "zone-name-1"
    assert h2["id"] == "zone-id-2"
    assert h2["name"] == "zone-name-2"




def test_lambda_handler_fail_400():
    params:RequestPathParams = {
        "regionName": TEST_REGION_NAME,
        "resourceType": "AWS::NOT::SUPPORTED", # type: ignore
    }
    event = {"pathParameters": params}
    response = lambda_handler(event, None)

    assert response["statusCode"] == 400
    ret_body = json.loads(response["body"])
    assert ret_body["error"] is not None and "resourceType" in ret_body["error"]

def test_lambda_handler_fail_500():
    params:RequestPathParams = {
        "regionName": TEST_REGION_NAME+"NotExist",
        "resourceType": "AWS::EC2::AvailabilityZone::Name",
    }
    event = {"pathParameters": params}
    response = lambda_handler(event, None)

    assert response["statusCode"] == 500
    ret_body = json.loads(response["body"])
    assert ret_body["error"] is not None


