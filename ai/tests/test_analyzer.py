from ai.analytics.safety_analyzer import SafetyAnalyzer


def main():

    analyzer = SafetyAnalyzer()


    detections = [

        {
            "name":"person",
            "confidence":0.95
        },

        {
            "name":"no_helmet",
            "confidence":0.91
        }

    ]


    result = analyzer.analyze(
        detections
    )


    print(result)



if __name__ == "__main__":
    main()