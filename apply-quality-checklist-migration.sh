#!/bin/bash

echo "This script will apply the quality checklist migration to your Supabase database."
echo ""
echo "You have two options:"
echo ""
echo "Option 1: Using Supabase CLI (recommended)"
echo "Run: npx supabase db push"
echo "You'll be prompted for your database password."
echo ""
echo "Option 2: Manual SQL execution"
echo "1. Go to: https://supabase.com/dashboard/project/zvqszimyodijulqpkbub/sql/new"
echo "2. Copy the contents of: supabase/migrations/20250616000000_add_quality_checklist_templates.sql"
echo "3. Paste and run the SQL"
echo ""
echo "After applying the migration:"
echo "1. Refresh your database types: npx supabase gen types typescript --project-id zvqszimyodijulqpkbub > types/database.types.ts"
echo "2. The quality checklist admin page will be available at: /admin/checklists"
echo ""
echo "Press any key to open the SQL editor in your browser..."
read -n 1 -s

# Open the Supabase SQL editor
open "https://supabase.com/dashboard/project/zvqszimyodijulqpkbub/sql/new"