import { Sdometer } from '@/components/ui/sdometer';
import { activeCard } from '@/components/ui/timeline/store';
import { cn } from '@/lib/utils';
import { records } from '@/shrekServices';
import { format } from 'date-fns';
import { useContext } from 'react';
import { ArrowsIndicator } from './Arrow';
import { Badges } from './Badges';
import { CardContext } from './CardContext';
import { CommentBox } from './CommentBox';
import { Pendings } from './Pendings';

export const Content = ({ className, children }: React.ComponentProps<'div'>) => {
	const { isSelected, fields } = useContext(CardContext);
	const { fields: editableRightNowFields } = records.store.editableRightNow();
	const { isResizeMode } = activeCard();

	return (
		<div
			className={cn(
				'border-dashed border-foreground/20 bg-blurable backdrop-blur-[2px] bg-card/90 relative min-w-full min-h-[2.5lh] text-2xs select-none transition-foo text-foreground',
				isSelected && 'bg-accent-strong/80 ' + (isResizeMode ? 'rounded-tl-lg' : 'rounded-bl-lg'),
				!isSelected && 'border-t-1',
				className,
			)}
		>
			{isSelected && <ArrowsIndicator isResizeMode={isResizeMode} />}

			<div className="text-4xl sticky top-[1lh] w-full">
				{isSelected ? (
					<div className="flex font-mono text-xl">
						<time
							className={cn('text-foreground inline-flex', isResizeMode || 'text-current')}
							dateTime={format(String(editableRightNowFields?.from), 'MM-dd')}
						>
							<Sdometer value={format(String(editableRightNowFields?.from), 'HH:mm')} />
						</time>
						<span className="text-foreground">-</span>
						<time className={cn('text-foreground inline-flex', isResizeMode && 'text-current')} dateTime={format(String(editableRightNowFields?.to), 'MM-dd')}>
							<Sdometer value={format(String(editableRightNowFields?.to), 'HH:mm')} />
						</time>
					</div>
				) : (
					<div className="flex items-center justify-between gap-3 px-3 py-2">
						<div className="flex-1 min-w-0">
							<CommentBox>
								{String(fields?.sign)}
							</CommentBox>
							<div className="text-sm text-muted-foreground">
								<Badges />
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex items-center gap-3">{children}</div>
							<div className="flex-shrink-0">
								<Pendings />
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
