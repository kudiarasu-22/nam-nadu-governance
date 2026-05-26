/**
 * Nam Nadu — Public Voting & Participation Page
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Vote as VoteIcon, Users, CheckCircle2 } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { MOCK_POLLS } from '@/mock';

export default function PublicVoting() {
  const { t } = useTranslation();
  const [polls, setPolls] = useState(MOCK_POLLS);
  const [votedPolls, setVotedPolls] = useState(new Set());

  const handleVote = (pollId, optionId) => {
    setVotedPolls(prev => new Set([...prev, pollId]));
    setPolls(currentPolls => 
      currentPolls.map(poll => {
        if (poll.id === pollId) {
          return {
            ...poll,
            totalVotes: poll.totalVotes + 1,
            options: poll.options.map(opt => 
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            )
          };
        }
        return poll;
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <VoteIcon className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
          {t('voting.title')}
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          {t('voting.description')}
        </p>
      </div>

      <div className="space-y-6">
        {polls.map(poll => {
          const hasVoted = votedPolls.has(poll.id);
          
          return (
            <Card key={poll.id} className="overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark pr-4">
                  {t(`voting.questions.${poll.question.replace(/ /g, '_').toLowerCase()}`, poll.question)}
                </h2>
                <Badge color="info" className="shrink-0">{t('voting.ends_in', { days: poll.ends_in_days })}</Badge>
              </div>

              <div className="space-y-3">
                {poll.options.map(option => {
                  const percentage = Math.round((option.votes / poll.totalVotes) * 100);
                  
                  return (
                    <div key={option.id} className="relative">
                      {hasVoted ? (
                        <div className="relative overflow-hidden rounded-xl border border-border-light dark:border-border-dark p-4">
                          <div 
                            className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="relative flex justify-between items-center z-10">
                            <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{t(`voting.options.${option.text.replace(/ /g, '_').toLowerCase()}`, option.text)}</span>
                            <span className="font-bold text-primary-700 dark:text-primary-300">{percentage}%</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleVote(poll.id, option.id)}
                          className="w-full text-left p-4 rounded-xl border-2 border-border-light dark:border-border-dark hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all font-medium text-text-primary-light dark:text-text-primary-dark group"
                        >
                          <div className="flex justify-between items-center">
                            <span>{t(`voting.options.${option.text.replace(/ /g, '_').toLowerCase()}`, option.text)}</span>
                            <div className="w-5 h-5 rounded-full border-2 border-border-light dark:border-border-dark group-hover:border-primary-500" />
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between text-sm text-text-secondary-light">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{poll.totalVotes} {t('voting.citizens_voted')}</span>
                </div>
                {hasVoted && (
                  <div className="flex items-center gap-1 text-success-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('voting.vote_recorded')}</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
