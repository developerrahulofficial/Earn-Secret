import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DrawingCanvas } from "./drawing-canvas";
import { Type, Pencil, Image, Sparkles, ArrowRight } from "lucide-react";

interface ShapeCreatorProps {
  onShapeCreated: (shapeType: "text" | "drawing" | "image", shapeData: string) => void;
  isLoading?: boolean;
}

export function ShapeCreator({ onShapeCreated, isLoading = false }: ShapeCreatorProps) {
  const [activeTab, setActiveTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleTextSubmit = () => {
    if (textInput.trim().length > 0 && textInput.length <= 12) {
      onShapeCreated("text", textInput.trim().toUpperCase());
    }
  };

  const handleDrawingComplete = (drawingData: string) => {
    onShapeCreated("drawing", drawingData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSubmit = () => {
    if (imagePreview) {
      onShapeCreated("image", imagePreview);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="font-display text-2xl">Create Your Secret</CardTitle>
        <CardDescription>
          Choose how to hide your surprise for your partner to discover
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="text" className="gap-2" data-testid="tab-text">
              <Type className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="draw" className="gap-2" data-testid="tab-draw">
              <Pencil className="h-4 w-4" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-2" data-testid="tab-image">
              <Image className="h-4 w-4" />
              Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter text (e.g., LOVE, NAME)"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value.slice(0, 12))}
                  className="text-center text-xl font-display tracking-wider h-14"
                  maxLength={12}
                  data-testid="input-secret-text"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {textInput.length}/12
                </span>
              </div>

              {textInput && (
                <div className="p-6 rounded-xl bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Preview
                  </p>
                  <p
                    className="font-display text-4xl font-bold text-primary tracking-widest"
                    data-testid="text-preview"
                  >
                    {textInput.toUpperCase()}
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleTextSubmit}
                disabled={textInput.trim().length === 0 || isLoading}
                data-testid="button-create-text"
              >
                Create Secret
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="draw" className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Draw a shape, heart, or anything you want to reveal
            </p>
            <DrawingCanvas onDrawingComplete={handleDrawingComplete} />
          </TabsContent>

          <TabsContent value="image" className="space-y-6">
            <div className="space-y-4">
              {!imagePreview ? (
                <label
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-48",
                    "border-2 border-dashed border-muted-foreground/30 rounded-xl",
                    "bg-muted/30 cursor-pointer transition-colors",
                    "hover:border-primary/50 hover:bg-muted/50"
                  )}
                  data-testid="dropzone-image"
                >
                  <Image className="h-10 w-10 text-muted-foreground mb-3" />
                  <span className="text-sm font-medium">Click to upload an image</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    data-testid="input-image-upload"
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-card-border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-contain bg-muted/30"
                      data-testid="img-preview"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setImagePreview(null)}
                      data-testid="button-remove-image"
                    >
                      Remove
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleImageSubmit}
                      disabled={isLoading}
                      data-testid="button-create-image"
                    >
                      Create Secret
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
