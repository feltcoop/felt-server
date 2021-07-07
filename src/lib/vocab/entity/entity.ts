// goal is to follow ActivityStreams:
// https://ryanatkn.github.io/corpus-activity-streams/

export interface Entity<TData = any> {
	type: 'Entity';
	id: string;
	data: TData;
}
