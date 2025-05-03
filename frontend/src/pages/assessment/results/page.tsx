import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/!to-migrate/button';
import { Card, CardContent } from '@/src/components/ui/!to-migrate/card';
import { MessageCircle, Save, Share2, Download } from 'lucide-react';

import { useEffect, useState } from 'react';
import { ChatModal } from '@/src/pages/chat/page';
import { FullscreenChat } from '@/src/pages/chat/FullScreenChat';
import { toast } from 'sonner';
import { Assessment } from '@/src/api/assessment/types';
import { postSend } from '@/src/api/assessment/requests/postSend/Request';

// Define the types of menstrual patterns as per LogicTree.md
type MenstrualPattern = 'regular' | 'irregular' | 'heavy' | 'pain' | 'developing';

interface PatternInfo {
  title: string;
  description: string;
  icon: string;
  recommendations: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

const patternData: Record<MenstrualPattern, PatternInfo> = {
  regular: {
    title: 'Regular Menstrual Cycles',
    description:
      'Your menstrual cycles follow a normal, healthy pattern according to ACOG guidelines.',
    icon: '/patternDataIcons/regularMenstrualCycles.svg',
    recommendations: [
      {
        icon: '📅',
        title: 'Track Your Cycle',
        description:
          'Regular tracking will help you understand your patterns better and predict your next period.'
      },
      {
        icon: '🏃‍♀️',
        title: 'Exercise Regularly',
        description: 'Light to moderate exercise can help reduce menstrual pain and improve mood.'
      },
      {
        icon: '❤️',
        title: 'Maintain a Balanced Diet',
        description:
          'Foods rich in iron, calcium, and omega-3 fatty acids can help manage period symptoms.'
      },
      {
        icon: '🌙',
        title: 'Prioritize Sleep',
        description:
          'Aim for 8-10 hours of sleep, especially during your period when fatigue is common.'
      }
    ]
  },
  irregular: {
    title: 'Irregular Timing Pattern',
    description:
      'Your cycle length is outside the typical range, which may indicate hormonal fluctuations.',
    icon: '/patternDataIcons/irregularTimingPattern.svg',
    recommendations: [
      {
        icon: '📅',
        title: 'Track Your Cycle',
        description:
          'Keeping a detailed record can help identify patterns and share with healthcare providers.'
      },
      {
        icon: '👩‍⚕️',
        title: 'Consult a Healthcare Provider',
        description:
          'If your cycles are consistently irregular, consider discussing with a healthcare provider.'
      },
      {
        icon: '🥗',
        title: 'Focus on Nutrition',
        description: 'A balanced diet can help support hormonal balance and regulate cycles.'
      },
      {
        icon: '🧘‍♀️',
        title: 'Stress Management',
        description:
          'High stress can affect your cycle. Consider yoga, meditation, or other relaxation techniques.'
      }
    ]
  },
  heavy: {
    title: 'Heavy or Prolonged Flow Pattern',
    description:
      'Your flow is heavier or longer than typical, which could impact your daily activities.',
    icon: '/patternDataIcons/heavyOrProlongedFlowPattern.svg',
    recommendations: [
      {
        icon: '🍳',
        title: 'Iron-rich Foods',
        description:
          'Include lean red meat, spinach, beans, and fortified cereals to prevent iron deficiency.'
      },
      {
        icon: '💧',
        title: 'Stay Hydrated',
        description: 'Drink plenty of water to help replace fluids lost during your period.'
      },
      {
        icon: '👩‍⚕️',
        title: 'Medical Evaluation',
        description:
          'If your flow regularly soaks through pads/tampons hourly, consult a healthcare provider.'
      },
      {
        icon: '⏰',
        title: 'Plan Ahead',
        description: 'Keep extra supplies and a change of clothes available during heavy flow days.'
      }
    ]
  },
  pain: {
    title: 'Pain-Predominant Pattern',
    description:
      'Your menstrual pain is higher than typical and may interfere with daily activities.',
    icon: '/patternDataIcons/painPredominantPattern.svg',
    recommendations: [
      {
        icon: '🔥',
        title: 'Heat Therapy',
        description: 'Apply a heating pad to your lower abdomen to help relieve menstrual cramps.'
      },
      {
        icon: '💊',
        title: 'Pain Management',
        description:
          'Over-the-counter pain relievers like ibuprofen can help reduce pain and inflammation.'
      },
      {
        icon: '🧘‍♀️',
        title: 'Gentle Exercise',
        description:
          'Light activities like walking or stretching can help alleviate menstrual pain.'
      },
      {
        icon: '👩‍⚕️',
        title: 'Medical Support',
        description:
          'If pain is severe, talk to a healthcare provider about additional treatment options.'
      }
    ]
  },
  developing: {
    title: 'Developing Pattern',
    description:
      'Your cycles are still establishing a regular pattern, which is normal during adolescence.',
    icon: '/patternDataIcons/developingPattern.svg',
    recommendations: [
      {
        icon: '⏱️',
        title: 'Be Patient',
        description:
          "It's normal for your cycle to be irregular during adolescence. It can take 2-3 years to establish a regular pattern."
      },
      {
        icon: '📅',
        title: 'Track Your Cycle',
        description: 'Start keeping a record of your periods to observe patterns as they develop.'
      },
      {
        icon: '🧠',
        title: 'Learn About Your Body',
        description: "Understanding menstrual health can help you recognize what's normal for you."
      },
      {
        icon: '👩‍👧',
        title: 'Talk to Someone You Trust',
        description: 'Discuss concerns with a parent, school nurse, or healthcare provider.'
      }
    ]
  }
};

export default function ResultsPage() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreenChatOpen, setIsFullscreenChatOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [pattern, setPattern] = useState<MenstrualPattern>('developing');
  const [age, setAge] = useState<string>('');
  const [cycleLength, setCycleLength] = useState<string>('');
  const [periodDuration, setPeriodDuration] = useState<string>('');
  const [flowLevel, setFlowLevel] = useState<string>('');
  const [painLevel, setPainLevel] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);

  // Helper function to normalize string values for more reliable comparisons
  const normalizeValue = (value: string | null): string => {
    if (!value) return '';

    const normalized = value.trim().toLowerCase();
    return normalized;
  };

  // Helper function to check if a string contains any of the given keywords
  const containsAny = (value: string | null, keywords: string[]): boolean => {
    if (!value) return false;

    const normalized = normalizeValue(value);
    return keywords.some((keyword) => normalized.includes(keyword));
  };

  useEffect(() => {
    // Get data from session storage
    const storedAge = sessionStorage.getItem('age');
    const storedCycleLength = sessionStorage.getItem('cycleLength');
    const storedPeriodDuration = sessionStorage.getItem('periodDuration');
    const storedFlowLevel = sessionStorage.getItem('flowLevel');
    const storedPainLevel = sessionStorage.getItem('painLevel');
    const storedSymptoms = sessionStorage.getItem('symptoms');
    const storedCyclePredictable = sessionStorage.getItem('cyclePredictable');

    if (storedAge) setAge(storedAge);
    if (storedCycleLength) setCycleLength(storedCycleLength);
    if (storedPeriodDuration) setPeriodDuration(storedPeriodDuration);
    if (storedFlowLevel) setFlowLevel(storedFlowLevel);
    if (storedPainLevel) setPainLevel(storedPainLevel);
    if (storedSymptoms) {
      try {
        setSymptoms(JSON.parse(storedSymptoms));
      } catch (e) {
        console.error('Error parsing symptoms:', e);
      }
    }

    // Determine the pattern based on LogicTree logic
    // Following the exact decision tree from LogicTree.md
    let determinedPattern: MenstrualPattern;
    const decisionPath = [];

    // Q1: Is cycle length between 21-45 days?
    const isCycleLengthNormal = !(
      containsAny(storedCycleLength, ['irregular']) ||
      containsAny(storedCycleLength, ['less than 21', '<21', 'less-than-21']) ||
      containsAny(storedCycleLength, ['more than 45', '>45', '45+'])
    );
    decisionPath.push(`Q1: Cycle length normal? ${isCycleLengthNormal}`);

    if (!isCycleLengthNormal) {
      // O1: Irregular Timing Pattern
      determinedPattern = 'irregular';
      decisionPath.push(`O1: Assigning pattern = "irregular"`);
    } else {
      // Q2: Does period last between 2-7 days?
      const isPeriodDurationNormal = !containsAny(storedPeriodDuration, [
        'more than 7',
        '>7',
        '8+',
        '8 days',
        '8-plus'
      ]);
      decisionPath.push(`Q2: Period duration normal? ${isPeriodDurationNormal}`);

      if (!isPeriodDurationNormal) {
        // O2: Heavy or Prolonged Flow Pattern
        determinedPattern = 'heavy';
        decisionPath.push(`O2: Assigning pattern = "heavy" (duration)`);
      } else {
        // Q3: Is flow light to moderate?
        const isFlowNormal = !containsAny(storedFlowLevel, ['heavy', 'very heavy']);
        decisionPath.push(`Q3: Flow normal? ${isFlowNormal}`);

        if (!isFlowNormal) {
          // O2: Heavy or Prolonged Flow Pattern
          determinedPattern = 'heavy';
          decisionPath.push(`O2: Assigning pattern = "heavy" (flow)`);
        } else {
          // Q4: Is menstrual pain none to moderate?
          const isPainNormal = !containsAny(storedPainLevel, ['severe', 'debilitating']);
          decisionPath.push(`Q4: Pain normal? ${isPainNormal}`);

          if (!isPainNormal) {
            // O3: Pain-Predominant Pattern
            determinedPattern = 'pain';
            decisionPath.push(`O3: Assigning pattern = "pain"`);
          } else {
            // Q5: Has cycle been predictable for at least 3 months?
            // Check if we have explicit data on cycle predictability
            decisionPath.push(`Q5: Checking cycle predictability...`);
            if (containsAny(storedCyclePredictable, ['no', 'false'])) {
              // O5: Developing Pattern - cycles not predictable
              determinedPattern = 'developing';
              decisionPath.push(
                `O5: Assigning pattern = "developing" (explicitly not predictable)`
              );
            } else if (containsAny(storedCyclePredictable, ['yes', 'true'])) {
              // O4: Regular Menstrual Cycles - cycles are predictable
              determinedPattern = 'regular';
              decisionPath.push(`O4: Assigning pattern = "regular" (explicitly predictable)`);
            } else {
              // We don't have explicit predictability data, so infer based on age
              decisionPath.push(
                `No explicit predictability data, inferring from age: ${storedAge}`
              );
              // If age is adolescent (12-17), assume developing, otherwise assume regular
              if (
                storedAge &&
                containsAny(storedAge, [
                  '12-14',
                  '15-17',
                  '13-17',
                  '12',
                  '13',
                  '14',
                  '15',
                  '16',
                  '17',
                  'teen',
                  'adolescent'
                ])
              ) {
                // O5: Developing Pattern
                determinedPattern = 'developing';
                decisionPath.push(`O5: Assigning pattern = "developing" (based on adolescent age)`);
              } else {
                // O4: Regular Menstrual Cycles
                determinedPattern = 'regular';
                decisionPath.push(`O4: Assigning pattern = "regular" (default for non-adolescent)`);
              }
            }
          }
        }
      }
    }

    setPattern(determinedPattern);
  }, []);

  const patternInfo = patternData[pattern];

  // Calculate progress bar widths based on values
  // const getProgressWidth = (value: string): string => {
  //   if (!value) return '0%';

  //   // Make sure value is a string for consistent handling
  //   const val = String(value).trim().toLowerCase();

  //   // Age handling
  //   if (val === '13-17') return '25%';
  //   if (val === '18-24') return '35%';
  //   if (val.includes('25')) return '45%'; // Handle "25+", "25-plus", etc.
  //   if (val.includes('35')) return '65%'; // Handle "35+", "35-plus", etc.
  //   if (val.includes('45')) return '85%'; // Handle "45+", "45-plus", etc.

  //   // Cycle length handling
  //   if (val.includes('less than 21')) return '20%';
  //   if (val.includes('21-25') || val === '21-25 days') return '30%';
  //   if (val.includes('26-30')) return '45%';
  //   if (val.includes('31-35')) return '60%';
  //   if (val.includes('36-40')) return '75%';
  //   if (val.includes('more than 45') || val.includes('45+')) return '100%';
  //   if (val.includes('irregular')) return '50%';

  //   // Period duration handling
  //   if (val.includes('1-2')) return '20%';
  //   if (val.includes('3-4')) return '40%';
  //   if (val.includes('5-7')) return '60%';
  //   if (val.includes('8+') || val.includes('8-plus') || val.includes('more than 7')) return '100%';

  //   // Flow level handling
  //   if (val === 'light' || val.includes('light')) return '25%';
  //   if (val === 'moderate' || val.includes('moderate')) return '50%';
  //   if (val === 'heavy' || val.includes('heavy')) return '75%';
  //   if (val.includes('very heavy') || val === 'very-heavy') return '100%';

  //   // Pain level handling
  //   if (val === 'mild' || val.includes('mild')) return '25%';
  //   if (val === 'moderate' || val.includes('moderate')) return '50%';
  //   if (val === 'severe' || val.includes('severe')) return '75%';
  //   if (val === 'debilitating' || val.includes('debilitating')) return '100%';

  //   // If we couldn't match anything specific, use sensible defaults
  //   if (val.includes('less than')) return '20%';
  //   if (val.includes('more than')) return '80%';

  //   return '50%'; // Default value
  // };

  // Force progress bars to update when values change
  useEffect(() => {
    // Trigger a re-render when these values change
    const progressElements = document.querySelectorAll('.bg-pink-600.h-2.rounded-full');
    if (progressElements.length > 0) {
      // This forces a style recalculation
      progressElements.forEach((el) => {
        el.classList.remove('bg-pink-500');
        setTimeout(() => el.classList.add('bg-pink-500'), 0);
      });
    }
  }, [age, cycleLength, periodDuration, flowLevel, painLevel]);

  // Function to handle saving assessment results
  const handleSaveResults = async () => {
    setIsSaving(true);

    try {
      // Make sure all required fields have values
      if (!pattern || !age || !cycleLength) {
        toast.error('Missing required assessment data');
        setIsSaving(false);
        return;
      }

      // Create assessment data object according to the Assessment interface structure
      const assessment: Omit<Assessment, 'id'> = {
        userId: '', // This will be set by the backend
        createdAt: new Date().toISOString(),
        assessment_data: {
          date: new Date().toISOString(),
          pattern,
          age,
          cycleLength,
          periodDuration: periodDuration || 'Not provided',
          flowHeaviness: flowLevel,
          painLevel: painLevel || 'Not provided',
          symptoms: {
            physical: symptoms || [],
            emotional: []
          },
          recommendations:
            patternInfo?.recommendations?.map((rec) => ({
              title: rec.title,
              description: rec.description
            })) || []
        }
      };

      // Use the postSend function
      const savedAssessment = await postSend(assessment);

      toast.success('Assessment saved successfully!');
      navigate(`/assessment/history/${savedAssessment.id}`);
    } catch (error) {
      console.error('Failed to save assessment:', error);
      toast.error('Failed to save assessment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-4xl flex-1 p-6">
        <div className="mb-8 h-2 w-full rounded-full bg-gray-200">
          <div className="h-2 w-full rounded-full bg-pink-500 transition-all duration-500"></div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold dark:text-slate-100">Your Assessment Results</h1>
          <p className="text-gray-600 dark:text-slate-200">
            {" Based on your responses, here's what we've found about your menstrual health."}
          </p>
        </div>

        <Card className="mb-8 w-full border shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-slate-800">
          <CardContent className="pb-8 pt-8">
            <div className="mb-8 text-center">
              <img
                src={patternData[pattern].icon}
                className="mx-auto mb-2 h-24 w-24"
                alt="menstrual-pattern-icon"
              />
              <h2 className="mb-2 text-2xl font-bold text-pink-600">
                {patternData[pattern].title}
              </h2>
              <p className="mx-auto max-w-2xl text-gray-600 dark:text-slate-200">
                {patternData[pattern].description}
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 dark:text-gray-900 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                <div>
                  <img src="/resultAssets/time.svg" className="h-[55px] w-[55px]" alt="time-icon" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium">Age Range</h3>
                  <p className="text-gray-600">{age || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                <div>
                  <img
                    src="/resultAssets/calendar.svg"
                    className="h-[55px] w-[55px]"
                    alt="calendar-icon"
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium">Cycle Length</h3>
                  <p className="text-gray-600">{cycleLength || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                <div>
                  <img src="/resultAssets/drop.svg" className="h-[55px] w-[55px]" alt="drop-icon" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium">Period Duration</h3>
                  <p className="text-gray-600">{periodDuration || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                <div>
                  <img
                    src="/resultAssets/d-drop.svg"
                    className="h-[55px] w-[55px]"
                    alt="d-drop-icon"
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium">Flow Level</h3>
                  <p className="text-gray-600">{flowLevel || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                <div>
                  <img
                    src="/resultAssets/emotion.svg"
                    className="h-[55px] w-[55px]"
                    alt="emotion-icon"
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium">Pain Level</h3>
                  <p className="text-gray-600">{painLevel || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex w-full max-w-full items-start gap-3 rounded-xl bg-gray-50 p-4">
                <div>
                  <img
                    src="/resultAssets/track-time.svg"
                    className="h-[55px] w-[55px]"
                    alt="track-time-icon"
                  />
                </div>
                <div className="flex-1 overflow-x-auto">
                  <h3 className="mb-2 text-lg font-medium">Symptoms</h3>
                  <p className="whitespace-normal break-words text-gray-600">
                    {symptoms.length > 0 ? symptoms.join(', ') : 'None reported'}
                  </p>
                </div>
              </div>
            </div>

            <h3 className="mb-4 text-xl font-bold">Recommendations</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {patternData[pattern].recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="rounded-xl border p-4 transition-colors duration-300 hover:bg-pink-50 dark:border-slate-800 dark:hover:text-gray-900"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{rec.icon}</div>
                    <div>
                      <h4 className="text-lg font-medium">{rec.title}</h4>
                      <p className="text-gray-600">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            className="flex items-center justify-center gap-2 bg-pink-600 px-6 py-6 text-lg text-white hover:bg-pink-700"
            onClick={() => setIsChatOpen(true)}
          >
            <MessageCircle className="h-5 w-5" />
            Chat with Dottie
          </Button>
          <Button
            className="flex items-center justify-center gap-2 border border-pink-200 bg-white px-6 py-6 text-lg text-pink-600 hover:bg-pink-50"
            onClick={handleSaveResults}
            disabled={isSaving}
          >
            <Save className="h-5 w-5 hover:text-pink-700" />
            {isSaving ? 'Saving...' : 'Save Results'}
          </Button>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to="/assessment/history">
            <Button
              variant="outline"
              className="flex items-center px-6 py-6 text-lg dark:bg-gray-900 dark:text-pink-600 dark:hover:text-pink-700"
            >
              View History
            </Button>
          </Link>

          <div className="hidden gap-4">
            <Button variant="outline" className="flex items-center gap-2 px-6 py-6 text-lg">
              <Share2 className="h-5 w-5" />
              Share
            </Button>
            <Button variant="outline" className="flex items-center gap-2 px-6 py-6 text-lg">
              <Download className="h-5 w-5" />
              Download
            </Button>
          </div>
        </div>
      </main>

      {isChatOpen &&
        (isFullscreenChatOpen ? (
          <FullscreenChat
            onClose={() => setIsChatOpen(false)}
            setIsFullscreen={setIsFullscreenChatOpen}
            initialMessage={`Hi! I've just completed my menstrual health assessment. My results show: ${patternData[pattern].title}. Can you tell me more about what this means?`}
          />
        ) : (
          <ChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            setIsFullscreen={setIsFullscreenChatOpen}
            initialMessage={`Hi! I've just completed my menstrual health assessment. My results show: ${patternData[pattern].title}. Can you tell me more about what this means?`}
          />
        ))}
    </div>
  );
}
