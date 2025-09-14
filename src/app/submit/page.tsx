'use client';

import { useState } from 'react';
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
import { Camera, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { categorizeComplaintImage } from '@/ai/flows/categorize-complaint-image';
import { useAuth } from '@/hooks/use-auth';
import { useComplaints } from '@/hooks/use-complaints';

const formSchema = z.object({
  category: z.enum(complaintCategories, {
    required_error: 'Please select a category.',
  }),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  location: z.string().min(3, 'Location must be at least 3 characters.'),
  photo: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitComplaintPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addComplaint } = useComplaints();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      location: '',
    },
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        form.setValue('photo', reader.result as string);
        handleAiCategorize(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  const onSubmit = (data: FormValues) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not Logged In',
            description: 'You must be logged in to submit a complaint.',
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
        status: 'Received',
        submittedAt: new Date().toISOString(),
        beforeImageUrl: data.photo,
    };

    addComplaint(newComplaint);

    toast({
      title: 'Complaint Submitted!',
      description: 'Thank you for your submission. You will be redirected to your history.',
    });
    
    router.push('/history');
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
            Provide as much detail as possible. Uploading a photo is highly recommended.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <div className="w-48 h-36 rounded-md border border-dashed flex items-center justify-center bg-muted/50">
                          {photoPreview ? (
                            <Image
                              src={photoPreview}
                              alt="Photo preview"
                              width={192}
                              height={144}
                              className="object-cover rounded-md w-full h-full"
                            />
                          ) : (
                            <Camera className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="photo-upload"
                          onChange={handlePhotoChange}
                        />
                         <label htmlFor="photo-upload" className="cursor-pointer">
                            <Button type="button" variant="outline" asChild>
                                <span>{photoPreview ? 'Change Photo' : 'Upload Photo'}</span>
                            </Button>
                        </label>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a photo of the issue. The AI will try to categorize it for you.
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
                    {form.formState.dirtyFields.category && !isCategorizing && (
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Overflowing dustbin on the corner..."
                        {...field}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        placeholder="e.g., Main St & 1st Ave"
                        {...field}
                      />
                    </FormControl>
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
