from ai.report.response_formatter import format_ai_response


def test_response_formatter():

    violations = [

        {
            "type":"Fire Detected",
            "severity":"CRITICAL",
            "confidence":0.92
        }

    ]


    result = format_ai_response(
        violations
    )


    print(result)


    assert result["risk_level"] == "CRITICAL"


if __name__ == "__main__":
    test_response_formatter()