-- Add 'Quantitative Developer' and 'Coding' to the question categories.
alter table public.questions drop constraint questions_category_check;
alter table public.questions add constraint questions_category_check check (category in (
  'Probability', 'Market making', 'Mental math', 'Brainteaser', 'Estimation', 'Behavioral',
  'Quantitative Developer', 'Coding'
));
