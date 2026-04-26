import torch
import segmentation_models_pytorch as smp

def get_model():
    model = smp.Unet(
        encoder_name="resnet34",
        encoder_weights=None,  
        in_channels=6,         
        classes=1,
        activation="sigmoid"
    )
    try:
        model.load_state_dict(torch.load("urban_model.pth", map_location="cpu"))
        print("Loaded trained model")
    except:
        print("No trained model found → using random weights (still works for demo)")
    model.eval()
    return model