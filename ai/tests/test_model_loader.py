from ai.models.model_loader import ModelLoader
from ai.utils.config import PERSON_MODEL

model = ModelLoader.load_model(PERSON_MODEL)

print(model)

print(ModelLoader.loaded_models())