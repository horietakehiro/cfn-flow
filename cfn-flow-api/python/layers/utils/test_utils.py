import pytest

from utils import convert_http_to_s3, get_current_dt, strftime

@pytest.mark.parametrize("http,s3", [
    ("https://bucket-name.s3.ap-northeast-1.amazonaws.com/path/to/object", "s3://bucket-name/path/to/object"),
    ("https://bucket-name.s3.ap-northeast-1.amazonaws.com/path/to/", "s3://bucket-name/path/to/"),
    ("https://bucket-name.s3.ap-northeast-1.amazonaws.com", "s3://bucket-name"),
])
def test_convert_http_to_s3(http:str, s3:str):

    ret_url = convert_http_to_s3(http)

    assert ret_url == s3

def test_get_current_dt_default():
    ret_dt = strftime(get_current_dt())
    assert ret_dt.endswith("+0900")

def test_get_current_dt_custom():
    ret_dt = strftime(get_current_dt(hours=7))
    assert ret_dt.endswith("+0700")

