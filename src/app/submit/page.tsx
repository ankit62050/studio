
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { complaintCategories, ComplaintCategory, Complaint } from '@/lib/types';
import { Camera, Loader2, Sparkles, MapPin, Mic, MicOff, Video, X } from 'lucide-react';
import Image from 'next/image';
import { categorizeComplaintImage } from '@/ai/flows/categorize-complaint-image';
import { useAuth } from '@/hooks/use-auth';
import { useComplaints } from '@/hooks/use-complaints';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CameraCapture } from '@/components/camera-capture';

const MAX_PHOTOS = 3;

const formSchema = z.object({
  category: z.enum(complaintCategories, {
    required_error: 'Please select a category.',
  }),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  location: z.string().min(3, 'Location must be at least 3 characters.'),
  photos: z.array(z.string()).min(1, `Please upload at least one photo.`).max(MAX_PHOTOS, `You can upload a maximum of ${MAX_PHOTOS} photos.`).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitComplaintPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addComplaint } = useComplaints();
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      location: '',
      photos: [],
    },
  });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.interimResults = true;
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        const currentDescription = form.getValues('description');
        form.setValue('description', (currentDescription ? currentDescription + ' ' : '') + finalTranscript.trim());
      }
    };
    
    recognition.onspeechstart = () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };

    recognition.onspeechend = () => {
      silenceTimeoutRef.current = setTimeout(() => {
        stopListening();
      }, 3000);
    };

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = `Error: ${event.error}`;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
      } else if (event.error === 'no-speech') {
        errorMessage = 'No speech was detected. Please try again.';
      }
      toast({
          variant: 'destructive',
          title: 'Speech Recognition Error',
          description: errorMessage,
      });
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, toast]);
  
  const startListening = () => {
    if (!recognitionRef.current) {
        toast({
            variant: 'destructive',
            title: 'Not Supported',
            description: 'Your browser does not support voice recognition.',
        });
        return;
    }
    if (isListening) return;

    try {
        recognitionRef.current.start();
        toast({ title: 'Listening...' });
    } catch(e) {
        toast({
            variant: 'destructive',
            title: 'Could not start listening',
            description: 'Please ensure microphone permissions are enabled.',
        });
    }
  };

  const stopListening = () => {
      if (!recognitionRef.current || !isListening) return;
      recognitionRef.current.stop();
      toast({ title: 'Stopped listening.' });
  };
  
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const remainingSlots = MAX_PHOTOS - photoPreviews.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      if (filesToProcess.length === 0) {
        toast({
          title: 'Maximum photos reached',
          description: `You can only upload up to ${MAX_PHOTOS} photos.`,
        });
        return;
      }
      
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const photoDataUri = reader.result as string;
          setPhotoPreviews(prev => {
            const newPreviews = [...prev, photoDataUri];
            form.setValue('photos', newPreviews);
            // Trigger AI categorization only for the first image.
            if (newPreviews.length === 1) {
              handleAiCategorize(photoDataUri);
            }
            return newPreviews;
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const handleRemovePhoto = (index: number) => {
    setPhotoPreviews(prev => {
        const newPreviews = prev.filter((_, i) => i !== index);
        form.setValue('photos', newPreviews);
        return newPreviews;
    });
  }

  const handleCapture = (photoDataUri: string) => {
    if (photoPreviews.length < MAX_PHOTOS) {
      setPhotoPreviews(prev => {
        const newPreviews = [...prev, photoDataUri];
        form.setValue('photos', newPreviews);
        if (newPreviews.length === 1) {
          handleAiCategorize(photoDataUri);
        }
        return newPreviews;
      });
    } else {
       toast({
          title: 'Maximum photos reached',
          description: `You cannot add more than ${MAX_PHOTOS} photos.`,
       });
    }
    setIsCameraDialogOpen(false);
  };


  const handleAiCategorize = async (photoDataUri: string) => {
    setIsCategorizing(true);
    try {
      const result = await categorizeComplaintImage({ photoDataUri });
      if (result.suggestedCategory && complaintCategories.includes(result.suggestedCategory as any)) {
        form.setValue('category', result.suggestedCategory as ComplaintCategory);
        toast({
          title: 'AI Suggestion',
          description: `We've suggested a category based on your photo.`,
        });
      }
    } catch (error) {
      console.error('AI categorization failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Suggestion Failed',
        description: 'Could not get an AI category suggestion.',
      });
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
        toast({
            variant: 'destructive',
            title: 'Geolocation Not Supported',
            description: 'Your browser does not support location detection.',
        });
        return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            form.setValue('latitude', latitude);
            form.setValue('longitude', longitude);

            try {
                // Using OpenStreetMap's free Nominatim reverse geocoding API
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                
                if (data && data.display_name) {
                    form.setValue('location', data.display_name);
                     toast({
                        title: 'Location Detected!',
                        description: 'Your location has been filled in.',
                    });
                } else {
                    form.setValue('location', `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`);
                }
            } catch (error) {
                 toast({
                    variant: 'destructive',
                    title: 'Could Not Fetch Address',
                    description: 'Location coordinates found, but failed to fetch address.',
                });
                form.setValue('location', `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`);
            } finally {
                setIsDetectingLocation(false);
            }
        },
        (error) => {
            let description = 'An unknown error occurred.';
            if (error.code === error.PERMISSION_DENIED) {
                description = 'Please allow location access in your browser settings.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                description = 'Location information is unavailable.';
            }
            toast({
                variant: 'destructive',
                title: 'Location Detection Failed',
                description: description,
            });
            setIsDetectingLocation(false);
        }
    );
  };

  const onSubmit = (data: FormValues) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not Logged In',
            description: 'You must be logged in to submit a complaint.',
        });
        return;
    }
    if(!data.photos || data.photos.length === 0) {
       toast({
            variant: 'destructive',
            title: 'Photo Required',
            description: 'Please upload at least one photo for the complaint.',
        });
        return;
    }

    setIsSubmitting(true);
    
    const newComplaint: Complaint = {
        id: `complaint-${Date.now()}`,
        userId: user.id,
        category: data.category,
        description: data.description,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        status: 'Received',
        submittedAt: new Date().toISOString(),
        beforeImageUrls: data.photos,
        upvotedBy: [],
        comments: [],
    };

    addComplaint(newComplaint);

    toast({
      title: 'Complaint Submitted!',
      description: 'Thank you for your submission. You will be redirected to your history.',
    });
    
    setTimeout(() => {
        router.push('/history');
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Complaint</h1>
        <p className="text-muted-foreground">
          Fill out the form below to submit a new complaint.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complaint Details</CardTitle>
          <CardDescription>
            Provide as much detail as possible. You can upload up to {MAX_PHOTOS} photos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="photos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photos</FormLabel>
                    <div className="flex flex-wrap items-start gap-4">
                      {photoPreviews.map((preview, index) => (
                        <div key={index} className="relative w-48 h-36">
                          <Image
                            src={preview}
                            alt={`Photo preview ${index + 1}`}
                            width={192}
                            height={144}
                            className="object-cover rounded-md w-full h-full"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => handleRemovePhoto(index)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove photo</span>
                          </Button>
                        </div>
                      ))}
                      {photoPreviews.length < MAX_PHOTOS && (
                        <div className="w-48 h-36 rounded-md border border-dashed flex flex-col items-center justify-center bg-muted/50 p-2 gap-2">
                           <Input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                id="photo-upload"
                                onChange={handlePhotoChange}
                                disabled={photoPreviews.length >= MAX_PHOTOS}
                            />
                            <Button asChild type="button" variant="outline" size="sm" disabled={photoPreviews.length >= MAX_PHOTOS}>
                                <label htmlFor="photo-upload" className="cursor-pointer">
                                    <Camera className="mr-2 h-4 w-4" />
                                    Upload
                                </label>
                            </Button>
                             <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline" size="sm" disabled={photoPreviews.length >= MAX_PHOTOS}>
                                        <Video className="mr-2 h-4 w-4" /> Camera
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>Capture Photo</DialogTitle>
                                    </DialogHeader>
                                    <CameraCapture onCapture={handleCapture} onClose={() => setIsCameraDialogOpen(false)}/>
                                </DialogContent>
                            </Dialog>
                             <p className="text-xs text-muted-foreground text-center">Add up to {MAX_PHOTOS} images</p>
                        </div>
                      )}
                    </div>
                     <FormDescription>
                      The first image will be used by AI to suggest a category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                        Category
                        {isCategorizing && <Loader2 className="h-4 w-4 animate-spin" />}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isCategorizing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {complaintCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.isDirty && form.getValues('photos') && form.getValues('photos')!.length > 0 && !isCategorizing && (
                       <FormDescription className="flex items-center gap-2 text-green-600">
                          <Sparkles className="h-4 w-4" />
                          Category suggested by AI based on your image!
                       </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Description</FormLabel>
                      <Button type="button" variant={isListening ? 'destructive' : 'outline'} size="icon" onClick={toggleListening} className="h-8 w-8">
                          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          <span className="sr-only">{isListening ? 'Stop Listening' : 'Start Listening'}</span>
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Overflowing dustbin on the corner..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {isListening ? 'Listening... Speak now.' : 'You can use the microphone to dictate the description.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location / Address</FormLabel>
                    <div className="flex gap-2">
                        <FormControl>
                        <Input
                            placeholder="e.g., Main St & 1st Ave"
                            {...field}
                        />
                        </FormControl>
                        <Button type="button" variant="outline" size="icon" onClick={handleDetectLocation} disabled={isDetectingLocation}>
                            {isDetectingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                            <span className="sr-only">Detect Location</span>
                        </Button>
                    </div>
                     <FormDescription>
                      You can enter the address manually or use the button to detect your current location.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Complaint
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
