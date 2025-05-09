export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          dietary_restrictions: string[] | null
          allergies: string[] | null
          medical_health_preferences: string[]
          lifestyle_dietary_preferences: string[]
          religious_preferences: string[]
          pantry_items: string[]
          metric_system: boolean
          temperature_unit: '°C' | '°F'
          dark_mode: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          dietary_restrictions?: string[] | null
          allergies?: string[] | null
          medical_health_preferences?: string[]
          lifestyle_dietary_preferences?: string[]
          religious_preferences?: string[]
          pantry_items?: string[]
          metric_system?: boolean
          temperature_unit?: '°C' | '°F'
          dark_mode?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          dietary_restrictions?: string[] | null
          allergies?: string[] | null
          medical_health_preferences?: string[]
          lifestyle_dietary_preferences?: string[]
          religious_preferences?: string[]
          pantry_items?: string[]
          metric_system?: boolean
          temperature_unit?: '°C' | '°F'
          dark_mode?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          cuisines: string[]
          ingredients: Json
          instructions: Json
          dietary_tags: string[] | null
          cooking_time: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          cuisines: string[]
          ingredients: Json
          instructions: Json
          dietary_tags?: string[] | null
          cooking_time?: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          cuisines?: string[]
          ingredients?: Json
          instructions?: Json
          dietary_tags?: string[] | null
          cooking_time?: string | null
          difficulty?: 'easy' | 'medium' | 'hard'
          created_at?: string
          updated_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          recipe_id: string
          user_id: string
          rating: number
          review: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          user_id: string
          rating: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          user_id?: string
          rating?: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}