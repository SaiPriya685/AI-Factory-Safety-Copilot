"""
classes.py

YOLO class name mapping.
"""


COCO_CLASSES = {

    0: "person",
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    4: "airplane",
    5: "bus",
    6: "train",
    7: "truck",

}


def get_class_name(class_id):

    return COCO_CLASSES.get(
        class_id,
        "unknown"
    )