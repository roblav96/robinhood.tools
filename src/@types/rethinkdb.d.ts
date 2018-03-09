// Type definitions for RethinkDB v2.2.0
// Project: http://rethinkdb.com/
// Definitions by: Bazyli Brzóska <https://invent.life/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// Reference: http://www.rethinkdb.com/api/#js

// Previous definitions by: Sean Hess <https://seanhess.github.io/>

declare namespace rethinkdb {
	export interface RSequence<RemoteT> extends
		RAny,
		RCoercable,
		RToJSON,
		r.avg<RemoteT>,
		r.contains<RemoteT>,
		r.count.sequence<RemoteT>,
		r.default_<RemoteT>,
		r.forEach<RemoteT>,
		r.group<RemoteT>,
		r.isEmpty,
		r.limit,
		r.max<RemoteT>,
		r.min<RemoteT>,
		r.nth.sequence,
		r.offsetsOf<RemoteT>,
		r.reduce<RemoteT>,
		r.slice,
		r.sum<RemoteT>,
		r.union
	{ }
	export interface RSequenceArray<RemoteT> extends
		RSequence<RemoteT>,
		RRunable<Array<RemoteT>>,
		r.bracketsGetByIndex<RValue<RemoteT>>, // TODO: sure?
		r.bracketsPluckSequence,
		r.concatMap.array<RemoteT>,
		r.eqJoin.array<RemoteT>,
		r.filter<RemoteT>,
		r.distinct<RArray<RemoteT>>,
		r.hasFields<RArray<RemoteT>>,
		r.innerJoin.array<RemoteT>,
		r.merge.array<RemoteT>,
		r.orderBy<RemoteT, RArray<RemoteT>>,
		r.outerJoin.array<RemoteT>,
		r.pluck.array,
		r.without.array,
		r.sample<RArray<RemoteT>>,
		r.skip<RArray<RemoteT>>,
		r.withFields<RArray<RemoteT>>
	{ }
	export interface RArray<RemoteT> extends
		RSequenceArray<RemoteT>,
		r.add<r.arrayLike<RemoteT>, RArray<RemoteT>>,
		r.append<RemoteT>,
		r.changeAt<RemoteT>,
		r.deleteAt<RemoteT>,
		r.difference<RemoteT>,
		r.insertAt<RemoteT>,
		r.map.array<RemoteT>,
		r.mul<RArray<RemoteT>>,
		r.prepend<RemoteT>,
		r.setDifference<RemoteT>,
		r.setInsert<RemoteT>,
		r.setIntersection<RemoteT>,
		r.setUnion<RemoteT>,
		r.spliceAt<RemoteT>
	{ }
	export interface RArrayJoin<TLeft, TRight> extends
		RArray<{ left: TLeft, right: TRight }>,
		r.zip<RArray<TLeft & TRight>>
	{ }
	export interface RSequenceStream<RemoteT> extends
		RSequence<RemoteT>,
		RRunable<RCursor<RemoteT>>,
		r.bracketsGetByIndex<RStream<RemoteT>>,
		r.concatMap.stream<RemoteT>,
		r.eqJoin.stream<RemoteT>,
		r.filter<RemoteT>,
		r.getField.stream,
		r.hasFields<RStream<RemoteT>>,
		r.includes.stream,
		r.innerJoin.stream<RemoteT>,
		r.intersects.stream,
		r.map.stream<RemoteT>,
		r.merge.stream<RemoteT>,
		r.outerJoin.sequence<RemoteT>,
		r.without.sequence,
		r.pluck.sequence,
		r.sample<RSelection<RemoteT>>,
		r.skip<RStream<RemoteT>>,
		r.withFields<RStream<RemoteT>>
	{ }
	export interface RStream<RemoteT> extends
		RObservable<RemoteT>,
		RSequenceStream<RemoteT>,
		r.distinct.sequence<RemoteT>,
		r.orderBy<RemoteT, RSequence<RemoteT>>
	// note: distinct and orderBy is defined in RStream,
	// because table is a type of a stream that has a different signature for those two
	// TODO: check if `sample` return type is correct
	{ }
	export interface RStreamJoin<TLeft, TRight> extends
		RStream<JoinResult<TLeft, TRight>>,
		r.zip<RStream<TLeft & TRight>>
	{ }
	export interface RSelection<RemoteT> extends
		RStream<RemoteT>,
		ROperations<RemoteT>
	{ }
	export interface RValue<RemoteT> extends
		RAny,
		RCoercable,
		RRunable<RemoteT>,
		RToJSON,
		r.default_<RemoteT>,
		r.operators<RemoteT>
	{ }
	export interface RBool extends
		RValue<boolean>,
		r.and, r.not, r.or
	{ }
	export interface RNumber extends
		RValue<number>,
		r.add<r.numberLike, RNumber>,
		r.ceil,
		r.div,
		r.floor,
		r.mod,
		r.mul<RNumber>,
		r.round,
		r.sub<r.numberLike, RNumber>
	{ }
	export interface RString extends
		RValue<string>,
		r.add<r.stringLike, RString>,
		r.downcase,
		r.match,
		r.split,
		r.upcase
	{ }
	export interface RTime extends
		RValue<Date>,
		r.add<r.dateLike, RTime>,
		r.sub<r.dateLike, RTime>,
		r.date, r.dayOfWeek, r.dayOfYear,
		r.during, r.inTimezone,
		r.seconds, r.minutes, r.hours, r.month, r.year, r.day,
		r.timeOfDay, r.timezone, r.toEpochTime, r.toISO8601
	{ }
	export interface RSpecial extends
		RAny
	{ }
	export interface RObject<RemoteT> extends
		RAny,
		RRunable<RemoteT>,
		RGetField,
		RToJSON,
		RCoercable,
		r.hasFields<RBool>,
		r.merge.objectz<RemoteT>,
		r.pluck.objectz,
		r.without.objectz,
		r.default_<RemoteT> {
		/**
		 * Return an array containing all of an object's keys. Note that the keys will be sorted as described in [ReQL data types](/docs/data-types/#sorting-order) (for strings, lexicographically).
		 *
		 * singleSelection.keys() → array
		 * object.keys() → array
		 * **Example:** Get all the keys from a table row.
		 *
		 *     // row: { id: 1, mail: "fred@example.com", name: "fred" }
		 *
		 *     r.table('users').get(1).keys().run(conn, callback);
		 *     // Result passed to callback
		 *     [ "id", "mail", "name" ]
		 *
		 * http://rethinkdb.com/api/javascript/keys
		 */
		keys(): RArray<string>;

		/**
		 * # Command syntax
		 *
		 * Return an array containing all of an object's values. `values()` guarantees the values will come out in the same order as [keys](/api/javascript/keys).
		 *
		 * singleSelection.values() → array
		 * object.values() → array
		 * **Example:** Get all of the values from a table row.
		 *
		 *     // row: { id: 1, mail: "fred@example.com", name: "fred" }
		 *
		 *     r.table('users').get(1).values().run(conn, callback);
		 *     // Result passed to callback
		 *     [ 1, "fred@example.com", "fred" ]
		 *
		 * http://rethinkdb.com/api/javascript/values
		 */
		values(): RArray<RemoteT>;
	}
	export interface RSingleSelection<RemoteT> extends
		RObject<RemoteT>,
		RValue<RemoteT>,
		ROperations<RemoteT>,
		RObservable<RemoteT>
	//RSelection<RemoteT> // HACK: UNABLE TO EXTEND, SO DUPLICATED FROM SELECTION INTERFACE
	{ }
	export interface RAny {
		/**
		 * Call an anonymous function using return values from other ReQL commands or queries as arguments.
		 *
		 * **Example:** Compute a golfer's net score for a game.
		 *
		 * `js r.table('players').get('f19b5f16-ef14-468f-bd48-e194761df255').do( function (player) { return player('gross_score').sub(player('course_handicap')); } ).run(conn, callback);`
		 *
		 * any.do(function) → anyr.do([args]*, function) → anyany.do(expr) → anyr.do([args]*, expr) → any
		 *
		 *
		 * http://rethinkdb.com/api/javascript/do
		 */
		// do<R extends RAny>(...args_and_then_a_function):R;
		do<R extends RAny>(expr: (thisObject: RAny) => R): R;
		do<R extends RAny, Arg1 extends RAny>(arg1: Arg1, expr: (arg1: Arg1) => R): R;
		do<R extends RAny, Arg1 extends RAny, Arg2 extends RAny>(arg1: Arg1, arg2: Arg2, expr: (arg1: Arg1, arg2: Arg2) => R): R;
		do<R extends RAny, Arg1 extends RAny, Arg2 extends RAny, Arg3 extends RAny>(arg1: Arg1, arg2: Arg2, arg3: Arg3, expr: (arg1: Arg1, arg2: Arg2, arg3: Arg3) => R): R;

		/**
		 * Get information about a ReQL value.
		 *
		 * any.info() → object
		 * r.info(any) → object
		 * **Example:** Get information about a table such as primary key, or cache size.
		 *
		 *     r.table('marvel').info().run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/info
		 */
		info(): RObject<any>;
		// TODO: write proper object output

		/**
		 * Gets the type of a value.
		 *
		 * any.typeOf() → string
		 * **Example:** Get the type of a string.
		 *
		 *     r.expr("foo").typeOf().run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/type_of
		 */
		typeOf(): RString;
	}

	type IndexFunction<T> = RValue<any> | Array<RValue<any>> | ((item: RValue<T> | RObject<T>) => RValue<any>);
	type KeyType = r.stringLike | r.numberLike | r.arrayLike<string | number> | r.dateLike;

	interface IndexOptions {
		index?: string;
		leftBound?: 'closed' | 'open';
		rightBound?: 'closed' | 'open';
	}

	export interface RTable<RemoteT> extends
		RSequenceStream<RemoteT>, RObservable<RemoteT>, // instead of RSelection<RemoteT>,
		ROperations<RemoteT>,
		RConfigurable,
		r.distinct.table<RemoteT>,
		r.orderBy<RemoteT, RTableSlice<RemoteT>> {
		/**
		 * Get all documents between two keys. Accepts three optional arguments: `index`, `left_bound`, and `right_bound`. If `index` is set to the name of a secondary index, `between` will return all documents where that index's value is in the specified range (it uses the primary key by default). `left_bound` or `right_bound` may be set to `open` or `closed` to indicate whether or not to include that endpoint of the range (by default, `left_bound` is closed and `right_bound` is open).
		 *
		 * table.between(lowerKey, upperKey[, options]) → table_slice
		 * table_slice.between(lowerKey, upperKey[, options]) → table_slice
		 * **Example:** Find all users with primary key >= 10 and < 20 (a normal half-open interval).
		 *
		 *     r.table('marvel').between(10, 20).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/between
		 */
		between(lowerKey: KeyType, upperKey: KeyType, options?: IndexOptions): RTableSlice<RemoteT>;

		/**
		 * Get a document by primary key.
		 *
		 * If no document exists with that primary key, `get` will return `null`.
		 *
		 * table.get(key) → singleRowSelection
		 * **Example:** Find a document by UUID.
		 *
		 *     r.table('posts').get('a9849eef-7176-4411-935b-79a6e3c56a74').run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/get
		 */
		get(key: KeyType): RSingleSelection<RemoteT>;

		/**
		 * Get all documents where the given value matches the value of the requested index.
		 *
		 * table.getAll(key[, key2...], [, {index:'id'}]) → selection
		 * **Example:** Secondary index keys are not guaranteed to be unique so we cannot query via [get](/api/javascript/get/) when using a secondary index.
		 *
		 *     r.table('marvel').getAll('man_of_steel', {index:'code_name'}).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/get_all
		 */
		getAll(args?: any, options?: { index: string }): RSelection<RemoteT>; // TODO: add this everywhere! || 1 month LATER: add what?
		getAll(key: KeyType, ...keys_and_then_options: Array<KeyType | { index?: string }>): RSelection<RemoteT>;
		getAll(key: KeyType, options?: { index: string }): RSelection<RemoteT>;
		getAll(key: KeyType, ...keys: Array<KeyType>): RSelection<RemoteT>;
		getAll(range: Array<KeyType>, options?: { index: string }): RSelection<RemoteT>;
		getAll(args: RSpecial, options?: { index: string }): RSelection<RemoteT>; // TODO: add this everywhere! || 1 month LATER: add what?

		/**
		 * Get all documents where the given geometry object intersects the geometry object of the requested geospatial index.
		 *
		 * table.getIntersecting(geometry, {index: 'indexname'}) → selection<stream>
		 * **Example:** Which of the locations in a list of parks intersect `circle1`?
		 *
		 *     var circle1 = r.circle([-117.220406,32.719464], 10, {unit: 'mi'});
		 *     r.table('parks').getIntersecting(circle1, {index: 'area'}).run(conn, callback);
		 *
		 * http://rethinkdb.com/api/javascript/get_intersecting
		 */
		getIntersecting(geometry: RGeometry<any>, options?: { index: string }): RStream<RemoteT>;

		/**
		 * Get all documents where the specified geospatial index is within a certain distance of the specified point (default 100 kilometers).
		 *
		 * table.getNearest(point, {index: 'indexname'[, maxResults: 100, maxDist: 100000, unit: 'm', geoSystem: 'WGS84']}) → selection<array>
		 * **Example:** Return a list of enemy hideouts within 5000 meters of the secret base.
		 *
		 *     var secretBase = r.point(-122.422876,37.777128);
		 *     r.table('hideouts').getNearest(secretBase,
		 *         {index: 'location', maxDist: 5000}
		 *     ).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/get_nearest
		 */
		getNearest(point: RPoint, options?: { index: string, maxResults?: number, maxDist?: number, unit?: string, geoSystem?: string }): RSelection<Array<RemoteT>>;

		/**
		 * Create a new secondary index on a table.
		 *
		 * table.indexCreate(indexName[, indexFunction][, {multi: false, geo: false}]) → object
		 * **Example:** Create a simple index based on the field `postId`.
		 *
		 *     r.table('comments').indexCreate('postId').run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/index_create
		 */
		indexCreate(indexName: r.stringLike, indexFunction: IndexFunction<RemoteT>, options?: { multi?: boolean, geo?}): RObject<any>;
		indexCreate(indexName: r.stringLike, options?: { multi?: boolean, geo?}): RObject<any>;
		// TODO: indexCreate result object

		/**
		 * Delete a previously created secondary index of this table.
		 *
		 * table.indexDrop(indexName) → object
		 * **Example:** Drop a secondary index named 'code_name'.
		 *
		 *     r.table('dc').indexDrop('code_name').run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/index_drop
		 */
		indexDrop(indexName: r.stringLike): RObject<any>;
		// TODO: index result object

		/**
		 * List all the secondary indexes of this table.
		 *
		 * table.indexList() → array
		 * **Example:** List the available secondary indexes for this table.
		 *
		 *     r.table('marvel').indexList().run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/index_list
		 */
		indexList(): RArray<any>;
		// TODO: index result object

		/**
		 * Rename an existing secondary index on a table. If the optional argument `overwrite` is specified as `true`, a previously existing index with the new name will be deleted and the index will be renamed. If `overwrite` is `false` (the default) an error will be raised if the new index name already exists.
		 *
		 * table.indexRename(oldIndexName, newIndexName[, {overwrite: false}]) → object
		 * **Example:** Rename an index on the comments table.
		 *
		 *     r.table('comments').indexRename('postId', 'messageId').run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/index_rename
		 */
		indexRename(oldIndexName: r.stringLike, newIndexName: r.stringLike, options?: { overwrite?: boolean }): RObject<any>;
		// TODO: index result object

		/**
		 * Get the status of the specified indexes on this table, or the status of all indexes on this table if no indexes are specified.
		 *
		 * table.indexStatus([, index...]) → array
		 * **Example:** Get the status of all the indexes on `test`:
		 *
		 *     r.table('test').indexStatus().run(conn, callback)
		 *
		 * **Example:** Get the status of the `timestamp` index:
		 *
		 *     r.table('test').indexStatus('timestamp').run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/index_status
		 */
		indexStatus(...indexes: Array<string>): RArray<any>;
		indexStatus(): RArray<any>;
		// TODO: index result object

		/**
		 * Wait for the specified indexes on this table to be ready, or for all indexes on this table to be ready if no indexes are specified.
		 *
		 * table.indexWait([, index...]) → array
		 * **Example:** Wait for all indexes on the table `test` to be ready:
		 *
		 *     r.table('test').indexWait().run(conn, callback)
		 *
		 * **Example:** Wait for the index `timestamp` to be ready:
		 *
		 *     r.table('test').indexWait('timestamp').run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/index_wait
		 */
		indexWait(...indexes: Array<string>): RArray<any>;
		indexWait(): RArray<any>;
		// TODO: index result object

		/**
		 * Return the status of a table.
		 *
		 * table.status() → selection<object>
		 * **Example:** Get a table's status.
		 *
		 *     > r.table('superheroes').status().run(conn, callback);
		 *
		 * http://rethinkdb.com/api/javascript/status
		 */
		status(): RSingleSelection<any>;
		// TODO: status result object

		/**
		 * `sync` ensures that writes on a given table are written to permanent storage. Queries that specify soft durability (`{durability: 'soft'}`) do not give such guarantees, so `sync` can be used to ensure the state of these queries. A call to `sync` does not return until all previous writes to the table are persisted.
		 *
		 * table.sync()→ object
		 * **Example:** After having updated multiple heroes with soft durability, we now want to wait until these changes are persisted.
		 *
		 *     r.table('marvel').sync().run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/sync
		 */
		sync(): RObject<any>;
		// TODO: status result object
	}
	export interface RBinary extends
		RCoercable,
		RAny,
		r.count.binary,
		r.slice
	{ }
	export interface RToJSON extends RAny {
		/**
		 * Convert a ReQL value or object to a JSON string. You may use either `toJsonString` or `toJSON`.
		 *
		 * value.toJsonString() → stringvalue.toJSON() → string
		 * **Example:** Get a ReQL document as a JSON string.
		 *
		 *     > r.table('hero').get(1).toJSON()
		 *     // result returned to callback
		 *     '{"id": 1, "name": "Batman", "city": "Gotham", "powers": ["martial arts", "cinematic entrances"]}'
		 *
		 * http://rethinkdb.com/api/javascript/to_json_string
		 */
		toJsonString(): RString;

		/**
		 * Convert a ReQL value or object to a JSON string. You may use either `toJsonString` or `toJSON`.
		 *
		 * value.toJsonString() → stringvalue.toJSON() → string
		 * **Example:** Get a ReQL document as a JSON string.
		 *
		 *     > r.table('hero').get(1).toJSON()
		 *     // result returned to callback
		 *     '{"id": 1, "name": "Batman", "city": "Gotham", "powers": ["martial arts", "cinematic entrances"]}'
		 *
		 * http://rethinkdb.com/api/javascript/to_json_string
		 */
		toJSON(): RString;
	}
	export interface RTableSlice<RemoteT> extends RTable<RemoteT> { }

	export interface RExpression {
		<T extends RNumber>(expression: r.numberLike): T;
		<T extends RBool>(expression: r.boolLike): T;
		<T extends RString>(expression: r.stringLike): T;
		<T extends RArray<any>>(expression: r.arrayLike<any>): T;
		<T extends RObject<any>>(expression: r.objectLike<any>): T;
		<T extends RTime>(expression: r.dateLike): T;
		<T extends RGeometry<any>>(expression: T): T;
		<T extends number>(expression: r.numberLike): RNumber;
		<T extends boolean>(expression: r.boolLike): RBool;
		<T extends string>(expression: r.stringLike): RString;
		<T extends Array<any>>(expression: r.arrayLike<any>): RArray<any>;
		<T extends Date>(expression: r.dateLike): RTime;
		<T extends {}>(expression: r.objectLike<any>): RObject<T>;
	}
	export interface RGetFieldBase {
		/**
		 * Get a single field from an object or a single element from a sequence.
		 *
		 * sequence(attr) → sequence
		 * singleSelection(attr) → value
		 * object(attr) → value
		 * array(index) → value
		 * **Example:** What was Iron Man's first appearance in a comic?
		 *
		 *     r.table('marvel').get('IronMan')('firstAppearance').run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/bracket
		 */
		(attr: r.stringLike | r.numberLike): RValue<any>;
		<T extends RNumber>(attr: r.stringLike | r.numberLike): RNumber;
		<T extends RString>(attr: r.stringLike | r.numberLike): RString;
		<T extends RArray<any>>(attr: r.stringLike | r.numberLike): T;
		<T extends RObject<any>>(attr: r.stringLike | r.numberLike): T;
		<T extends RTime>(attr: r.stringLike | r.numberLike): RTime;
		<T extends RGeometry<any>>(attr: r.stringLike | r.numberLike): T;
		<T extends number>(attr: r.stringLike | r.numberLike): RNumber;
		<T extends string>(attr: r.stringLike | r.numberLike): RString;
		<T extends Array<any>>(attr: r.stringLike | r.numberLike): RArray<any>;
		<T extends Date>(attr: r.stringLike | r.numberLike): RTime;
		<T extends {}>(attr: r.stringLike | r.numberLike): RObject<T>;
	}

	export interface RGetField extends RGetFieldBase {
		/**
		 * Get a single field from an object. If called on a sequence, gets that field from every object in the sequence, skipping objects that lack it.
		 *
		 * sequence.getField(attr) → sequence
		 * singleSelection.getField(attr) → value
		 * object.getField(attr) → value
		 * **Example:** What was Iron Man's first appearance in a comic?
		 *
		 *     r.table('marvel').get('IronMan').getField('firstAppearance').run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/get_field
		 */
		getField: RGetFieldBase;
		// TODO: implement getFields the same as bracket
	}

	namespace r {
		// TODO: functions should be RFunctions
		type numberLike = (() => number | RNumber) | number | RNumber;
		type stringLike = (() => string | RString) | string | RString;
		type objectLike<T extends Object> = (() => T | RValue<T>) | T | RValue<T>;
		type arrayLike<T> = (() => Array<T> | RArray<T>) | Array<T> | RArray<T>;
		type dateLike = (() => Date | RTime) | Date | RTime | numberLike;  // TODO: verify date can take a number
		type boolLike = boolean | RBool;
		type rLike<T> = T | r.objectLike<T> | r.numberLike | r.stringLike | r.arrayLike<T> | r.dateLike | r.boolLike;
		type rQuery<T> = RSelection<T> | RTable<T> | RTableSlice<T> | RSingleSelection<T>; //|RSequence<T>;

		interface add<TIn, TOut> {
			/**
			 * Sum two or more numbers, or concatenate two or more strings or arrays.
			 *
			 * value.add(value[, value, ...]) → valuetime.add(number[, number, ...]) → time
			 * **Example:** It's as easy as 2 + 2 = 4.
			 *
			 *     r.expr(2).add(2).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/add
			 */
			add(value: TIn, ...values: Array<TIn>): TOut;
			add(value: TIn): TOut;
		}
		interface sub<TIn, TOut> {
			/**
			 * Subtract two numbers.
			 *
			 * number.sub(number[, number, ...]) → numbertime.sub(number[, number, ...]) → timetime.sub(time) → number
			 * **Example:** It's as easy as 2 - 2 = 0.
			 *
			 *     r.expr(2).sub(2).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/sub
			 */
			sub(number: TIn, ...numbers: Array<TIn>): TOut;
			sub(number: TIn): TOut;
		}
		interface ceil {
			/**
			 * Rounds the given value up, returning the smallest integer value greater than or equal to the given value (the value's ceiling).
			 *
			 * r.ceil(number) → numbernumber.ceil() → number
			 * **Example:** Return the ceiling of 12.345.
			 *
			 *     > r.ceil(12.345).run(conn, callback);
			 *
			 *     13.0
			 *
			 * http://rethinkdb.com/api/javascript/ceil
			 */
			ceil(): RNumber;
		}
		interface div {
			/**
			 * Divide two numbers.
			 *
			 * number.div(number[, number ...]) → number
			 * **Example:** It's as easy as 2 / 2 = 1.
			 *
			 *     r.expr(2).div(2).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/div
			 */
			div(number: r.numberLike, ...numbers: Array<r.numberLike>): RNumber;
			div(number: r.numberLike): RNumber;
		}
		interface floor {
			/**
			 * Rounds the given value down, returning the largest integer value less than or equal to the given value (the value's floor).
			 *
			 * r.floor(number) → numbernumber.floor() → number
			 * **Example:** Return the floor of 12.345.
			 *
			 *     > r.floor(12.345).run(conn, callback);
			 *
			 *     12.0
			 *
			 * http://rethinkdb.com/api/javascript/floor
			 */
			floor(): RNumber;
		}
		interface mod {
			/**
			 * Find the remainder when dividing two numbers.
			 *
			 * number.mod(number) → number
			 * **Example:** It's as easy as 2 % 2 = 0.
			 *
			 *     r.expr(2).mod(2).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/mod
			 */
			mod(number: r.numberLike): RNumber;
		}
		interface mul<TOut> {
			/**
			 * Multiply two numbers, or make a periodic array.
			 *
			 * number.mul(number[, number, ...]) → numberarray.mul(number[, number, ...]) → array
			 * **Example:** It's as easy as 2 * 2 = 4.
			 *
			 *     r.expr(2).mul(2).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/mul
			 */
			mul(number: r.numberLike, ...numbers: Array<r.numberLike>): TOut;
			mul(number: r.numberLike): TOut;
		}
		interface round {
			/**
			 * Rounds the given value to the nearest whole integer.
			 *
			 * r.round(number) → numbernumber.round() → number
			 * **Example:** Round 12.345 to the nearest integer.
			 *
			 *     > r.round(12.345).run(conn, callback);
			 *
			 *     12.0
			 *
			 * http://rethinkdb.com/api/javascript/round
			 */
			round(): RNumber;
		}

		// string
		interface downcase {
			/**
			 * Lowercases a string.
			 *
			 * string.downcase() → string
			 * **Example:**
			 *
			 *     r.expr("Sentence about LaTeX.").downcase().run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/downcase
			 */
			downcase(): RString;
		}
		interface match {
			/**
			 * Matches against a regular expression. If there is a match, returns an object with the fields:
			 *
			 * *   `str`: The matched string
			 * *   `start`: The matched string's start
			 * *   `end`: The matched string's end
			 * *   `groups`: The capture groups defined with parentheses
			 *
			 * If no match is found, returns `null`.
			 *
			 * string.match(regexp) → null/object
			 * **Example:** Get all users whose name starts with "A".
			 *
			 *     r.table('users').filter(function(doc){
			 *         return doc('name').match("^A")
			 *     }).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/match
			 */
			match(regexp): RObject<{ str: string, start: number, end: number, groups: Array<string> }> & RBool;
		}
		interface split {
			/**
			 * Splits a string into substrings. Splits on whitespace when called with no arguments. When called with a separator, splits on that separator. When called with a separator and a maximum number of splits, splits on that separator at most `max_splits` times. (Can be called with `null` as the separator if you want to split on whitespace while still specifying `max_splits`.)
			 *
			 * Mimics the behavior of Python's `string.split` in edge cases, except for splitting on the empty string, which instead produces an array of single-character strings.
			 *
			 * string.split([separator, [max_splits]]) → array
			 * **Example:** Split on whitespace.
			 *
			 *     r.expr("foo  bar bax").split().run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/split
			 */
			split(separator?: string, max_splits?: number): RArray<string>;
		}
		interface upcase {
			/**
			 * Uppercases a string.
			 *
			 * string.upcase() → string
			 * **Example:**
			 *
			 *     r.expr("Sentence about LaTeX.").upcase().run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/upcase
			 */
			upcase(): RString;
		}

		// array
		interface append<T> {
			/**
			 * Append a value to an array.
			 *
			 * array.append(value) → array
			 * **Example:** Retrieve Iron Man's equipment list with the addition of some new boots.
			 *
			 *     r.table('marvel').get('IronMan')('equipment').append('newBoots').run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/append
			 */
			append(value: T): RArray<T>;
		}
		interface changeAt<T> {
			/**
			 * Change a value in an array at a given index. Returns the modified array.
			 *
			 * array.changeAt(index, value) → array
			 * **Example:** Bruce Banner hulks out.
			 *
			 *     r.expr(["Iron Man", "Bruce", "Spider-Man"]).changeAt(1, "Hulk").run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/change_at
			 */
			changeAt(index: r.numberLike, value: T): RArray<T>;
		}
		interface deleteAt<T> {
			/**
			 * Remove one or more elements from an array at a given index. Returns the modified array.
			 *
			 * array.deleteAt(index [,endIndex]) → array
			 * **Example:** Delete the second element of an array.
			 *
			 *     > r(['a','b','c','d','e','f']).deleteAt(1).run(conn, callback)
			 *     // result passed to callback
			 *     ['a', 'c', 'd', 'e', 'f']
			 *
			 * http://rethinkdb.com/api/javascript/delete_at
			 */
			deleteAt(index: r.numberLike, endIndex?: r.numberLike): RArray<T>;
		}
		interface difference<T> {
			/**
			 * Remove the elements of one array from another array.
			 *
			 * array.difference(array) → array
			 * **Example:** Retrieve Iron Man's equipment list without boots.
			 *
			 *     r.table('marvel').get('IronMan')('equipment').difference(['Boots']).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/difference
			 */
			difference(array: r.arrayLike<T>): RArray<T>;
		}
		interface insertAt<T> {
			/**
			 * Insert a value in to an array at a given index. Returns the modified array.
			 *
			 * array.insertAt(index, value) → array
			 * **Example:** Hulk decides to join the avengers.
			 *
			 *     r.expr(["Iron Man", "Spider-Man"]).insertAt(1, "Hulk").run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/insert_at
			 */
			insertAt(index: r.numberLike, value: T): RArray<T>;
		}

		namespace map {
			interface array<T> {
				/**
				 * Transform each element of one or more sequences by applying a mapping function to them. If `map` is run with two or more sequences, it will iterate for as many items as there are in the shortest sequence.
				 *
				 * sequence1.map([sequence2, ...], function) → stream
				 * array1.map([array2, ...], function) → array
				 * r.map(sequence1[, sequence2, ...], function) → stream
				 * r.map(array1[, array2, ...], function) → array
				 * **Example:** Return the first five squares.
				 *
				 *     r.expr([1, 2, 3, 4, 5]).map(function (val) {
				 *         return val.mul(val);
				 *     }).run(conn, callback);
				 *     // Result passed to callback
				 *     [1, 4, 9, 16, 25]
				 *
				 * http://rethinkdb.com/api/javascript/map
				 */
				// note: RValue<TOut> is needed when doing r.branch
				map<TOut>(mappingExpression: RValue<TOut> | ((item: RValue<T> | RObject<T>) => TOut)): RArray<TOut>
			}
			interface stream<T> {
				/**
				 * Transform each element of one or more sequences by applying a mapping function to them. If `map` is run with two or more sequences, it will iterate for as many items as there are in the shortest sequence.
				 *
				 * sequence1.map([sequence2, ...], function) → stream
				 * array1.map([array2, ...], function) → array
				 * r.map(sequence1[, sequence2, ...], function) → stream
				 * r.map(array1[, array2, ...], function) → array
				 * **Example:** Return the first five squares.
				 *
				 *     r.expr([1, 2, 3, 4, 5]).map(function (val) {
				 *         return val.mul(val);
				 *     }).run(conn, callback);
				 *     // Result passed to callback
				 *     [1, 4, 9, 16, 25]
				 *
				 * http://rethinkdb.com/api/javascript/map
				 */
				// NOTE: RValue<TOut> is needed when doing r.branch
				// NOTE: RValue<T> & RObject makes it more permissive (not exact type check here)
				map<TOut>(mappingExpression: RValue<TOut> | ((item: RValue<T> & RObject<T>) => TOut)): RStream<TOut>

			}
			interface r {
				// there are only for r.map:
				// TODO: fixme
				//map(...arrays_and_then_a_function:Array<RArray | Array<any> | ExpressionFunction<RValue<any>, RAny | Object>>): RArray;
				//map(...sequences_and_then_a_function:Array<RSequence | Array<any> | ExpressionFunction<RValue<any>, RAny | Object>>): RArray;
				//map(a_function:ExpressionFunction<RValue<any>, RAny | Object>): RArray;
				//map(array1:RArray | Array<any>, ...arrays_and_then_a_function:Array<RArray | Array<any> | ExpressionFunction<RValue<any>, RAny | Object>>): RArray;
				//map(array1:RArray | Array<any>, a_function:ExpressionFunction<RValue<any>, RAny | Object>): RArray;
			}
		}
		interface prepend<T> {
			/**
			 * Prepend a value to an array.
			 *
			 * array.prepend(value) → array
			 * **Example:** Retrieve Iron Man's equipment list with the addition of some new boots.
			 *
			 *     r.table('marvel').get('IronMan')('equipment').prepend('newBoots').run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/prepend
			 */
			prepend(value: T): RArray<T>;
		}
		interface setDifference<T> {
			/**
			 * Remove the elements of one array from another and return them as a set (an array with distinct values).
			 *
			 * array.setDifference(array) → array
			 * **Example:** Check which pieces of equipment Iron Man has, excluding a fixed list.
			 *
			 *     r.table('marvel').get('IronMan')('equipment').setDifference(['newBoots', 'arc_reactor']).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/set_difference
			 */
			setDifference(array: r.arrayLike<T>): RArray<T>;
		}
		interface setInsert<T> {
			/**
			 * Add a value to an array and return it as a set (an array with distinct values).
			 *
			 * array.setInsert(value) → array
			 * **Example:** Retrieve Iron Man's equipment list with the addition of some new boots.
			 *
			 *     r.table('marvel').get('IronMan')('equipment').setInsert('newBoots').run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/set_insert
			 */
			setInsert(value: T): RArray<T>;
		}
		interface setIntersection<T> {
			/**
			 * Intersect two arrays returning values that occur in both of them as a set (an array with distinct values).
			 *
			 * array.setIntersection(array) → array
			 * **Example:** Check which pieces of equipment Iron Man has from a fixed list.
			 *
			 *     r.table('marvel').get('IronMan')('equipment').setIntersection(['newBoots', 'arc_reactor']).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/set_intersection
			 */
			setIntersection(array: r.arrayLike<T>): RArray<T>;
		}
		interface setUnion<T> {
			/**
			 * Add a several values to an array and return it as a set (an array with distinct values).
			 *
			 * array.setUnion(array) → array
			 * **Example:** Retrieve Iron Man's equipment list with the addition of some new boots and an arc reactor.
			 *
			 *     r.table('marvel').get('IronMan')('equipment').setUnion(['newBoots', 'arc_reactor']).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/set_union
			 */
			setUnion(array: r.arrayLike<T>): RArray<T>;
		}
		interface spliceAt<T> {
			/**
			 * Insert several values in to an array at a given index. Returns the modified array.
			 *
			 * array.spliceAt(index, array) → array
			 * **Example:** Hulk and Thor decide to join the avengers.
			 *
			 *     r.expr(["Iron Man", "Spider-Man"]).spliceAt(1, ["Hulk", "Thor"]).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/splice_at
			 */
			spliceAt(index: r.numberLike, array: r.arrayLike<T>): RArray<T>;
		}

		// join
		interface zip<TOutJoin> {
			/**
			 * Used to 'zip' up the result of a join by merging the 'right' fields into 'left' fields of each member of the sequence.
			 *
			 * stream.zip() → stream
			 * array.zip() → array
			 * **Example:** 'zips up' the sequence by merging the left and right fields produced by a join.
			 *
			 *     r.table('marvel').eqJoin('main_dc_collaborator', r.table('dc'))
			 *         .zip().run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/zip
			 */
			zip(): TOutJoin; //RArray<TLeft & TRight>;
		}

		// time
		interface date {
			/**
			 * Return a new time object only based on the day, month and year (ie. the same day at 00:00).
			 *
			 * time.date() → time
			 * **Example:** Retrieve all the users whose birthday is today
			 *
			 *     r.table("users").filter(function(user) {
		  *         return user("birthdate").date().eq(r.now().date())
		  *     }).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/date
			 */
			date(): RTime;
		}
		interface day {
			/**
			 * Return the day of a time object as a number between 1 and 31.
			 *
			 * time.day() → number
			 * **Example:** Return the users born on the 24th of any month.
			 *
			 *     r.table("users").filter(
			 *         r.row("birthdate").day().eq(24)
			 *     ).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/day
			 */
			day(): RNumber;
		}
		interface dayOfWeek {
			/**
			 * Return the day of week of a time object as a number between 1 and 7 (following ISO 8601 standard). For your convenience, the terms r.monday, r.tuesday etc. are defined and map to the appropriate integer.
			 *
			 * time.dayOfWeek() → number
			 * **Example:** Return today's day of week.
			 *
			 *     r.now().dayOfWeek().run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/day_of_week
			 */
			dayOfWeek(): RNumber;
		}
		interface dayOfYear {
			/**
			 * Return the day of the year of a time object as a number between 1 and 366 (following ISO 8601 standard).
			 *
			 * time.dayOfYear() → number
			 * **Example:** Retrieve all the users who were born the first day of a year.
			 *
			 *     r.table("users").filter(
			 *         r.row("birthdate").dayOfYear().eq(1)
			 *     )
			 *
			 * http://rethinkdb.com/api/javascript/day_of_year
			 */
			dayOfYear(): RNumber;
		}
		interface during {
			/**
			 * Return if a time is between two other times (by default, inclusive for the start, exclusive for the end).
			 *
			 * time.during(startTime, endTime[, options]) → bool
			 * **Example:** Retrieve all the posts that were posted between December 1st, 2013 (inclusive) and December 10th, 2013 (exclusive).
			 *
			 *     r.table("posts").filter(
			 *         r.row('date').during(r.time(2013, 12, 1), r.time(2013, 12, 10))
			 *     ).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/during
			 */
			during(startTime: r.dateLike, endTime: r.dateLike, options?): RBool; // TODO: options
		}
		interface hours {
			/**
			 * Return the hour in a time object as a number between 0 and 23.
			 *
			 * time.hours() → number
			 * **Example:** Return all the posts submitted after midnight and before 4am.
			 *
			 *     r.table("posts").filter(function(post) {
			 *         return post("date").hours().lt(4)
			 *     })
			 *
			 * http://rethinkdb.com/api/javascript/hours
			 */
			hours(): RNumber;
		}
		interface inTimezone {
			/**
			 * Return a new time object with a different timezone. While the time stays the same, the results returned by methods such as hours() will change since they take the timezone into account. The timezone argument has to be of the ISO 8601 format.
			 *
			 * time.inTimezone(timezone) → time
			 * **Example:** Hour of the day in San Francisco (UTC/GMT -8, without daylight saving time).
			 *
			 *     r.now().inTimezone('-08:00').hours().run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/in_timezone
			 */
			inTimezone(timezone: r.stringLike): RTime;
		}
		interface seconds {
			/**
			 * Return the seconds in a time object as a number between 0 and 59.999 (double precision).
			 *
			 * time.seconds() → number
			 * **Example:** Return the post submitted during the first 30 seconds of every minute.
			 *
			 *     r.table("posts").filter(function(post) {
			 *         return post("date").seconds().lt(30)
			 *     })
			 *
			 * http://rethinkdb.com/api/javascript/seconds
			 */
			seconds(): RNumber;
		}
		interface minutes {
			/**
			 * Return the minute in a time object as a number between 0 and 59.
			 *
			 * time.minutes() → number
			 * **Example:** Return all the posts submitted during the first 10 minutes of every hour.
			 *
			 *     r.table("posts").filter(function(post) {
			 *         return post("date").minutes().lt(10)
			 *     })
			 *
			 * http://rethinkdb.com/api/javascript/minutes
			 */
			minutes(): RNumber;
		}
		interface month {
			/**
			 * Return the month of a time object as a number between 1 and 12\. For your convenience, the terms r.january, r.february etc. are defined and map to the appropriate integer.
			 *
			 * time.month() → number
			 * **Example:** Retrieve all the users who were born in November.
			 *
			 *     r.table("users").filter(
			 *         r.row("birthdate").month().eq(11)
			 *     )
			 *
			 * http://rethinkdb.com/api/javascript/month
			 */
			month(): RNumber;
		}
		interface year {
			/**
			 * Return the year of a time object.
			 *
			 * time.year() → number
			 * **Example:** Retrieve all the users born in 1986.
			 *
			 *     r.table("users").filter(function(user) {
			 *         return user("birthdate").year().eq(1986)
			 *     }).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/year
			 */
			year(): RNumber;
		}
		interface timeOfDay {
			/**
			 * Return the number of seconds elapsed since the beginning of the day stored in the time object.
			 *
			 * time.timeOfDay() → number
			 * **Example:** Retrieve posts that were submitted before noon.
			 *
			 *     r.table("posts").filter(
			 *         r.row("date").timeOfDay().le(12*60*60)
			 *     ).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/time_of_day
			 */
			timeOfDay(): RNumber;
		}
		interface timezone {
			/**
			 * Return the timezone of the time object.
			 *
			 * time.timezone() → string
			 * **Example:** Return all the users in the "-07:00" timezone.
			 *
			 *     r.table("users").filter( function(user) {
			 *         return user("subscriptionDate").timezone().eq("-07:00")
			 *     })
			 *
			 * http://rethinkdb.com/api/javascript/timezone
			 */
			timezone(): RString;
		}
		interface toEpochTime {
			/**
			 * Convert a time object to its epoch time.
			 *
			 * time.toEpochTime() → number
			 * **Example:** Return the current time in seconds since the Unix Epoch with millisecond-precision.
			 *
			 *     r.now().toEpochTime()
			 *
			 * http://rethinkdb.com/api/javascript/to_epoch_time
			 */
			toEpochTime(): RNumber;
		}
		interface toISO8601 {
			/**
			 * Convert a time object to a string in ISO 8601 format.
			 *
			 * time.toISO8601() → string
			 * **Example:** Return the current ISO 8601 time.
			 *
			 *     r.now().toISO8601().run(conn, callback)
			 *     // Result passed to callback
			 *     "2015-04-20T18:37:52.690+00:00"
			 *
			 * http://rethinkdb.com/api/javascript/to_iso8601
			 */
			toISO8601(): RString;
		}

		// boolean
		interface and {
			/**
			 * Compute the logical "and" of one or more values.
			 *
			 * bool.and([bool, bool, ...]) → boolr.and([bool, bool, ...]) → bool
			 * **Example:** Return whether both `a` and `b` evaluate to true.
			 *
			 *     var a = true, b = false;
			 *     r.expr(a).and(b).run(conn, callback);
			 *     // result passed to callback
			 *     false
			 *
			 * http://rethinkdb.com/api/javascript/and
			 */
			and(...bools: Array<r.boolLike>): RBool;
		}
		interface not {
			/**
			 * Compute the logical inverse (not) of an expression.
			 *
			 * `not` can be called either via method chaining, immediately after an expression that evaluates as a boolean value, or by passing the expression as a parameter to `not`.
			 *
			 * bool.not() → boolnot(bool) → bool
			 * **Example:** Not true is false.
			 *
			 *     r(true).not().run(conn, callback)
			 *     r.not(true).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/not
			 */
			not(): RBool;
		}
		interface or {
			/**
			 * Compute the logical "or" of one or more values.
			 *
			 * bool.or([bool, bool, ...]) → boolr.or([bool, bool, ...]) → bool
			 * **Example:** Return whether either `a` or `b` evaluate to true.
			 *
			 *     var a = true, b = false;
			 *     r.expr(a).or(b).run(conn, callback);
			 *     // result passed to callback
			 *     true
			 *
			 * http://rethinkdb.com/api/javascript/or
			 */
			or(...bools: Array<r.boolLike>): RBool;
		}

		// sequence (array)
		interface bracketsGetByIndex<TOut> {
			/**
			 * Get a single field from an object or a single element from a sequence.
			 *
			 * sequence(attr) → sequence
			 * singleSelection(attr) → value
			 * object(attr) → value
			 * array(index) → value
			 * **Example:** What was Iron Man's first appearance in a comic?
			 *
			 *     r.table('marvel').get('IronMan')('firstAppearance').run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/bracket
			 */
			(index: r.numberLike): TOut;
		}
		namespace pluck {
			interface array {
				/**
				 * Plucks out one or more attributes from either an object or a sequence of objects (projection).
				 *
				 * sequence.pluck([selector1, selector2...]) → stream
				 * array.pluck([selector1, selector2...]) → array
				 * object.pluck([selector1, selector2...]) → object
				 * singleSelection.pluck([selector1, selector2...]) → object
				 * **Example:** We just need information about IronMan's reactor and not the rest of the document.
				 *
				 *     r.table('marvel').get('IronMan').pluck('reactorState', 'reactorPower').run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/pluck
				 */
				pluck<TPluck>(...selectors: Array<r.stringLike>): RArray<TPluck>;
			}
			interface sequence {
				/**
				 * Plucks out one or more attributes from either an object or a sequence of objects (projection).
				 *
				 * sequence.pluck([selector1, selector2...]) → stream
				 * array.pluck([selector1, selector2...]) → array
				 * object.pluck([selector1, selector2...]) → object
				 * singleSelection.pluck([selector1, selector2...]) → object
				 * **Example:** We just need information about IronMan's reactor and not the rest of the document.
				 *
				 *     r.table('marvel').get('IronMan').pluck('reactorState', 'reactorPower').run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/pluck
				 */
				pluck<TPluck>(...selectors: Array<r.stringLike>): RStream<TPluck>;
			}
			interface objectz {
				/**
				 * Plucks out one or more attributes from either an object or a sequence of objects (projection).
				 *
				 * sequence.pluck([selector1, selector2...]) → stream
				 * array.pluck([selector1, selector2...]) → array
				 * object.pluck([selector1, selector2...]) → object
				 * singleSelection.pluck([selector1, selector2...]) → object
				 * **Example:** We just need information about IronMan's reactor and not the rest of the document.
				 *
				 *     r.table('marvel').get('IronMan').pluck('reactorState', 'reactorPower').run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/pluck
				 */
				pluck<TPluck>(...selectors: Array<r.stringLike>): RObject<TPluck>;
			}
		}
		interface bracketsPluckSequence {
			/**
			 * Get a single field from an object or a single element from a sequence.
			 *
			 * sequence(attr) → sequence
			 singleSelection(attr) → value
			 object(attr) → value
			 array(index) → value
			 * **Example:** What was Iron Man's first appearance in a comic?
			 *
			 *     r.table('marvel').get('IronMan')('firstAppearance').run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/bracket
			 */
			// HACK: first one is not documented, but works on an array of objects
			<TPluck>(attr: r.stringLike): RArray<TPluck>;
		}
		namespace without {
			interface array {
				/**
				 * The opposite of pluck; takes an object or a sequence of objects, and returns them with the specified paths removed.
				 *
				 * sequence.without([selector1, selector2...]) → stream
				 * array.without([selector1, selector2...]) → array
				 * object.without([selector1, selector2...]) → object
				 * singleSelection.without([selector1, selector2...]) → object
				 * **Example:** Since we don't need it for this computation we'll save bandwidth and leave out the list of IronMan's romantic conquests.
				 *
				 *     r.table('marvel').get('IronMan').without('personalVictoriesList').run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/without
				 */
				without<TWithout>(...selectors: Array<r.stringLike>): RArray<TWithout>;
			}
			interface sequence {
				/**
				 * The opposite of pluck; takes an object or a sequence of objects, and returns them with the specified paths removed.
				 *
				 * sequence.without([selector1, selector2...]) → stream
				 * array.without([selector1, selector2...]) → array
				 * object.without([selector1, selector2...]) → object
				 * singleSelection.without([selector1, selector2...]) → object
				 * **Example:** Since we don't need it for this computation we'll save bandwidth and leave out the list of IronMan's romantic conquests.
				 *
				 *     r.table('marvel').get('IronMan').without('personalVictoriesList').run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/without
				 */
				without<TWithout>(...selectors: Array<r.stringLike>): RStream<TWithout>;
			}
			interface objectz {
				/**
				 * The opposite of pluck; takes an object or a sequence of objects, and returns them with the specified paths removed.
				 *
				 * sequence.without([selector1, selector2...]) → stream
				 * array.without([selector1, selector2...]) → array
				 * object.without([selector1, selector2...]) → object
				 * singleSelection.without([selector1, selector2...]) → object
				 * **Example:** Since we don't need it for this computation we'll save bandwidth and leave out the list of IronMan's romantic conquests.
				 *
				 *     r.table('marvel').get('IronMan').without('personalVictoriesList').run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/without
				 */
				without<TWithout>(...selectors: Array<r.stringLike>): RObject<TWithout>;
			}
		}
		namespace concatMap {
			type ConcatFunction<TItem, TOut> = (item: RObject<TItem>) => TOut;
			interface array<T> {
				/**
				 * Concatenate one or more elements into a single sequence using a mapping function.
				 *
				 * stream.concatMap(function) → streamarray.concatMap(function) → array
				 * **Example:** Construct a sequence of all monsters defeated by Marvel heroes. The field "defeatedMonsters" is an array of one or more monster names.
				 *
				 *     r.table('marvel').concatMap(function(hero) {
				 *         return hero('defeatedMonsters')
				 *     }).run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/concat_map
				 */
				//concatMap(concatFunction:ExpressionFunction<RObject<any>, RAny | Object>): RArray;
				//concatMap<U extends RNumber>(concatFunction:(item:RObject<T>)=>U): RArray<number>;

				// concatenating has to be done on arrays, so the output array will be of the same type
				concatMap<ArrOfT>(concatFunction: ConcatFunction<T, RValue<ArrOfT>>): RArray<ArrOfT>;
			}
			interface stream<T> {
				/**
				 * Concatenate one or more elements into a single sequence using a mapping function.
				 *
				 * stream.concatMap(function) → stream
				 * array.concatMap(function) → array
				 * **Example:** Construct a sequence of all monsters defeated by Marvel heroes. The field "defeatedMonsters" is an array of one or more monster names.
				 *
				 *     r.table('marvel').concatMap(function(hero) {
				 *         return hero('defeatedMonsters')
				 *     }).run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/concat_map
				 */
				//concatMap(concatFunction:ExpressionFunction<RObject<any>, RAny | Object>): RArray;
				//concatMap<U extends RNumber>(concatFunction:(item:RObject<T>)=>U): RArray<number>;

				// concatenating has to be done on arrays, so the output array will be of the same type
				concatMap<ArrOfT>(concatFunction: ConcatFunction<T, RValue<ArrOfT>>): RStream<ArrOfT>;
			}
		}
		namespace eqJoin {
			interface array<T> {
				/**
				 * Join tables using a field or function on the left-hand sequence matching primary keys or secondary indexes on the right-hand table. `eqJoin` is more efficient than other ReQL join types, and operates much faster. Documents in the result set consist of pairs of left-hand and right-hand documents, matched when the field on the left-hand side exists and is non-null and an entry with that field's value exists in the specified index on the right-hand side.
				 *
				 * **Example:** Match players with the games they've played against one another.
				 *
				 * `js r.table('players').eqJoin('gameId', r.table('games')).run(conn, callback)`
				 *
				 * sequence.eqJoin(leftField, rightTable[, {index:'id'}]) → sequence
				 * sequence.eqJoin(predicate_function, rightTable[, {index:'id'}]) → sequence
				 *
				 *
				 * http://rethinkdb.com/api/javascript/eq_join
				 */
				eqJoin<TRight>(leftField: r.stringLike, rightTable: RTable<TRight>, options?: { index?}): RArrayJoin<T, TRight>;
				eqJoin<TLeft, TRight>(predicate_function: (item: RObject<T>) => TLeft, rightTable: RTable<TRight>, options?: { index?}): RArrayJoin<TLeft, TRight>;
			}
			interface stream<T> {
				/**
				 * Join tables using a field or function on the left-hand sequence matching primary keys or secondary indexes on the right-hand table. `eqJoin` is more efficient than other ReQL join types, and operates much faster. Documents in the result set consist of pairs of left-hand and right-hand documents, matched when the field on the left-hand side exists and is non-null and an entry with that field's value exists in the specified index on the right-hand side.
				 *
				 * **Example:** Match players with the games they've played against one another.
				 *
				 * `js r.table('players').eqJoin('gameId', r.table('games')).run(conn, callback)`
				 *
				 * sequence.eqJoin(leftField, rightTable[, {index:'id'}]) → sequence
				 * sequence.eqJoin(predicate_function, rightTable[, {index:'id'}]) → sequence
				 *
				 *
				 * http://rethinkdb.com/api/javascript/eq_join
				 */
				eqJoin<TRight>(leftField: r.stringLike, rightTable: RTable<TRight>, options?: { index?}): RStreamJoin<T, TRight>;
				eqJoin<TLeft, TRight>(predicate_function: (item: RObject<T>) => TLeft, rightTable: RTable<TRight>, options?: { index?}): RStreamJoin<TLeft, TRight>;
			}
		}

		// TODO: item does not have to be RObject<T>
		type FilterPredicate<T> = (item: RObject<T>) => RBool;

		interface filter<T> {
			/**
			 * Get all the documents for which the given predicate is true.
			 *
			 * `filter` can be called on a sequence, selection, or a field containing an array of elements. The return type is the same as the type on which the function was called on.
			 *
			 * The body of every filter is wrapped in an implicit `.default(false)`, which means that if a non-existence errors is thrown (when you try to access a field that does not exist in a document), RethinkDB will just ignore the document. The `default` value can be changed by passing an object with a `default` field. Setting this optional argument to `r.error()` will cause any non-existence errors to return a `ReqlRuntimeError`.
			 *
			 * selection.filter(predicate_function[, {default: false}]) → selection
			 * stream.filter(predicate_function[, {default: false}]) → stream
			 * array.filter(predicate_function[, {default: false}]) → array
			 * **Example:** Get all the users that are 30 years old.
			 *
			 *     r.table('users').filter({age: 30}).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/filter
			 */
			filter(predicate_function_or_object: FilterPredicate<T> | T | RObject<T>, options?: { default: boolean }): this;
		}
		interface distinct<TOut> {
			/**
			 * Remove duplicate elements from the sequence.
			 *
			 * sequence.distinct() → array
			 * table.distinct([{index: <indexname>}]) → stream
			 * **Example:** Which unique villains have been vanquished by marvel heroes?
			 *
			 *     r.table('marvel').concatMap(function(hero) {
			 *         return hero('villainList')
			 *     }).distinct().run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/distinct
			 */
			distinct(options?: { index?: string }): TOut;
		}
		interface hasFields<TOut> {
			/**
			 * Test if an object has one or more fields. An object has a field if it has that key and the key has a non-null value. For instance, the object `{'a': 1,'b': 2,'c': null}` has the fields `a` and `b`.
			 *
			 * sequence.hasFields([selector1, selector2...]) → stream
			 * array.hasFields([selector1, selector2...]) → array
			 * object.hasFields([selector1, selector2...]) → boolean
			 * **Example:** Return the players who have won games.
			 *
			 *     r.table('players').hasFields('games_won').run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/has_fields
			 */
			hasFields(...selectors: Array<string>): TOut;
		}

		type JoinPredicate<TLeft, TRight> = (left: RObject<TLeft>, right: RObject<TRight>) => RBool;

		namespace innerJoin {
			interface array<T> {
				/**
				 * Returns an inner join of two sequences.
				 *
				 * sequence.innerJoin(otherSequence, predicate_function) → stream
				 * array.innerJoin(otherSequence, predicate_function) → array
				 * **Example:** Return a list of all matchups between Marvel and DC heroes in which the DC hero could beat the Marvel hero in a fight.
				 *
				 *     r.table('marvel').innerJoin(r.table('dc'), function(marvelRow, dcRow) {
				 *         return marvelRow('strength').lt(dcRow('strength'))
				 *     }).zip().run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/inner_join
				 */
				innerJoin<TRight>(otherSequence: RSequence<TRight>, predicate_function: JoinPredicate<T, TRight>): RArrayJoin<T, TRight>;
			}
			interface stream<T> {
				/**
				 * Returns an inner join of two sequences.
				 *
				 * sequence.innerJoin(otherSequence, predicate_function) → stream
				 * array.innerJoin(otherSequence, predicate_function) → array
				 * **Example:** Return a list of all matchups between Marvel and DC heroes in which the DC hero could beat the Marvel hero in a fight.
				 *
				 *     r.table('marvel').innerJoin(r.table('dc'), function(marvelRow, dcRow) {
				 *         return marvelRow('strength').lt(dcRow('strength'))
				 *     }).zip().run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/inner_join
				 */
				innerJoin<TRight>(otherSequence: RSequence<TRight>, predicate_function: JoinPredicate<T, TRight>): RStreamJoin<T, TRight>;
			}
		}
		interface limit {
			/**
			 * End the sequence after the given number of elements.
			 *
			 * sequence.limit(n) → stream
			 * array.limit(n) → array
			 * **Example:** Only so many can fit in our Pantheon of heroes.
			 *
			 *     r.table('marvel').orderBy('belovedness').limit(10).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/limit
			 */
			limit(n: r.numberLike): this;
		}

		type MergeParam<T> = Object | ((item: RObject<T>) => (RObject<any> | Object));

		namespace merge {
			interface array<T> {
				/**
				 * Merge two or more objects together to construct a new object with properties from all. When there is a conflict between field names, preference is given to fields in the rightmost object in the argument list.
				 *
				 * singleSelection.merge([object | function, object | function, ...]) → object
				 * object.merge([object | function, object | function, ...]) → object
				 * sequence.merge([object | function, object | function, ...]) → stream
				 * array.merge([object | function, object | function, ...]) → array
				 * **Example:** Equip Thor for battle.
				 *
				 *     r.table('marvel').get('thor').merge(
				 *         r.table('equipment').get('hammer'),
				 *         r.table('equipment').get('pimento_sandwich')
				 *     ).run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/merge
				 */
				merge<TOut>(...objects_or_functions: Array<MergeParam<T>>): RArray<TOut>;
			}
			interface stream<T> {
				/**
				 * Merge two or more objects together to construct a new object with properties from all. When there is a conflict between field names, preference is given to fields in the rightmost object in the argument list.
				 *
				 * singleSelection.merge([object | function, object | function, ...]) → object
				 * object.merge([object | function, object | function, ...]) → object
				 * sequence.merge([object | function, object | function, ...]) → stream
				 * array.merge([object | function, object | function, ...]) → array
				 * **Example:** Equip Thor for battle.
				 *
				 *     r.table('marvel').get('thor').merge(
				 *         r.table('equipment').get('hammer'),
				 *         r.table('equipment').get('pimento_sandwich')
				 *     ).run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/merge
				 */
				merge<TOut>(...objects_or_functions: Array<MergeParam<T>>): RStream<TOut>;
			}
			interface objectz<T> {
				merge<TOut>(...object_or_a_functions: Array<MergeParam<T>>): RObject<TOut>;
			}
		}
		interface orderBy<T, TOut> {
			/**
			 * Sort the sequence by document values of the given key(s). To specify the ordering, wrap the attribute with either `r.asc` or `r.desc` (defaults to ascending).
			 *
			* Sorting without an index requires the server to hold the sequence in memory, and is limited to 100,000 documents (or the setting of the `arrayLimit` option for [run](/api/javascript/run)). Sorting with an index can be done on arbitrarily large tables, or after a `between` command using the same index.
			*
			* table.orderBy([key | function...], {index: index_name}) → table_slice
			* selection.orderBy(key | function[, ...]) → selection
			* sequence.orderBy(key | function[, ...]) → array
			* **Example:** Order all the posts using the index `date`.
			*
			*     r.table('posts').orderBy({index: 'date'}).run(conn, callback)
			*
			* The index must have been previously created with [indexCreate](/api/javascript/index_create/).
			*
			*     r.table('posts').indexCreate('date').run(conn, callback)
			*
			* You can also select a descending ordering:
			*
			*     r.table('posts').orderBy({index: r.desc('date')}).run(conn, callback)
			*
			* http://rethinkdb.com/api/javascript/order_by
			*/
			orderBy(keys_or_functions: KeyType | ((item: RObject<T>) => RValue<any> | KeyType), ...more_and_then_optionally_options: Array<KeyType | ((item: RObject<T>) => RValue<any> | KeyType) | { index?: string }>): TOut;
			orderBy(keys_or_functions: KeyType | ((item: RObject<T>) => RValue<any> | KeyType), options?: { index?: string }): TOut;
			orderBy(options: { index: string }): TOut;
		}
		namespace outerJoin {
			interface array<T> {
				/**
				 * Returns a left outer join of two sequences.
				 *
				 * sequence.outerJoin(otherSequence, predicate_function) → stream
				 * array.outerJoin(otherSequence, predicate_function) → array
				 * **Example:** Return a list of all Marvel heroes, paired with any DC heroes who could beat them in a fight.
				 *
				 *     r.table('marvel').outerJoin(r.table('dc'), function(marvelRow, dcRow) {
				 *         return marvelRow('strength').lt(dcRow('strength'))
				 *     }).run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/outer_join
				 */
				outerJoin<TRight>(otherSequence: RSequence<TRight>, predicate_function: JoinPredicate<T, TRight>): RArray<T & TRight>;
			}
			interface sequence<T> {
				/**
				 * Returns a left outer join of two sequences.
				 *
				 * sequence.outerJoin(otherSequence, predicate_function) → stream
				 * array.outerJoin(otherSequence, predicate_function) → array
				 * **Example:** Return a list of all Marvel heroes, paired with any DC heroes who could beat them in a fight.
				 *
				 *     r.table('marvel').outerJoin(r.table('dc'), function(marvelRow, dcRow) {
				 *         return marvelRow('strength').lt(dcRow('strength'))
				 *     }).run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/outer_join
				 */
				outerJoin<TRight>(otherSequence: RSequence<TRight>, predicate_function: JoinPredicate<T, TRight>): RStream<T & TRight>;
			}
		}
		interface sample<TOut> {
			/**
			 * Select a given number of elements from a sequence with uniform random distribution. Selection is done without replacement.
			 *
			 * sequence.sample(number) → selection
			 * stream.sample(number) → array
			 * array.sample(number) → array
			 * **Example:** Select 3 random heroes.
			 *
			 *     r.table('marvel').sample(3).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/sample
			 */
			sample(number: r.numberLike): TOut;
		}
		interface skip<TOut> {
			/**
			 * Skip a number of elements from the head of the sequence.
			 *
			 * sequence.skip(n) → stream
			 * array.skip(n) → array
			 * **Example:** Here in conjunction with `orderBy` we choose to ignore the most successful heroes.
			 *
			 *     r.table('marvel').orderBy('successMetric').skip(10).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/skip
			 */
			skip(n: r.numberLike): TOut;
		}
		type Bounds = 'closed' | 'open';
		interface slice {
			/**
			 * Return the elements of a sequence within the specified range.
			 *
			 * **Example:** Return the fourth, fifth and sixth youngest players. (The youngest player is at index 0, so those are elements 3–5.)
			 *
			 * `js r.table('players').orderBy({index: 'age'}).slice(3,6).run(conn, callback)`
			 *
			 * selection.slice(startIndex[, endIndex, {leftBound:'closed', rightBound:'open'}]) → selection
			 * stream.slice(startIndex[, endIndex, {leftBound:'closed', rightBound:'open'}]) → stream
			 * array.slice(startIndex[, endIndex, {leftBound:'closed', rightBound:'open'}]) → array
			 * binary.slice(startIndex[, endIndex, {leftBound:'closed', rightBound:'open'}]) → binary
			 *
			 *
			 * http://rethinkdb.com/api/javascript/slice
			 */
			slice(startIndex: r.numberLike, endIndex: r.numberLike, options?: { leftBound?: Bounds, rightBound?: Bounds }): this;
			slice(startIndex: r.numberLike): this;
		}
		interface union {
			/**
			 * Merge two or more sequences. (Note that ordering is not guaranteed by `union`.)
			 *
			 * stream.union(sequence[, sequence, ...]) → stream
			 * array.union(sequence[, sequence, ...]) → array
			 * **Example:** Construct a stream of all heroes.
			 *
			 *     r.table('marvel').union(r.table('dc')).run(conn, callback);
			 *
			 * http://rethinkdb.com/api/javascript/union
			 */
			union(sequence: RSequence<any>, ...sequences: Array<RSequence<any>>): this;
			union(sequence: RSequence<any>): this;
			// TODO: it probably won't be this in all cases
		}
		interface withFields<TOut> {
			/**
			 * Plucks one or more attributes from a sequence of objects, filtering out any objects in the sequence that do not have the specified fields. Functionally, this is identical to `hasFields` followed by `pluck` on a sequence.
			 *
			 * sequence.withFields([selector1, selector2...]) → stream
			 * array.withFields([selector1, selector2...]) → array
			 * **Example:** Get a list of users and their posts, excluding any users who have not made any posts.
			 *
			 *     r.table('users').withFields('id', 'username', 'posts').run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/with_fields
			 */
			withFields(...selectors: Array<r.stringLike>): TOut;
		}

		// sequence (stream)
		namespace distinct {
			interface sequence<T> {
				/**
				 * Remove duplicate elements from the sequence.
				 *
				 * sequence.distinct() → array
				 * table.distinct([{index: <indexname>}]) → stream
				 * **Example:** Which unique villains have been vanquished by marvel heroes?
				 *
				 *     r.table('marvel').concatMap(function(hero) {
				 *         return hero('villainList')
				 *     }).distinct().run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/distinct
				 */
				distinct(): RArray<T>;
			}

			interface table<T> {
				/**
				 * Remove duplicate elements from the sequence.
				 *
				 * sequence.distinct() → array
				 * table.distinct([{index: <indexname>}]) → stream
				 * **Example:** Which unique villains have been vanquished by marvel heroes?
				 *
				 *     r.table('marvel').concatMap(function(hero) {
				 *         return hero('villainList')
				 *     }).distinct().run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/distinct
				 */
				distinct(options?: { index: string }): RStream<T>;
			}
		}
		namespace getField {
			interface stream {
				/**
				 * Get a single field from an object. If called on a sequence, gets that field from every object in the sequence, skipping objects that lack it.
				 *
				 * sequence.getField(attr) → sequence
				 * singleSelection.getField(attr) → value
				 * object.getField(attr) → value
				 * **Example:** What was Iron Man's first appearance in a comic?
				 *
				 *     r.table('marvel').get('IronMan').getField('firstAppearance').run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/get_field
				 */
				getField<TOut>(attr: r.stringLike): RStream<TOut>;
			}
		}
		namespace includes {
			interface stream {
				/**
				 * Tests whether a geometry object is completely contained within another. When applied to a sequence of geometry objects, `includes` acts as a [filter](/api/javascript/filter), returning a sequence of objects from the sequence that include the argument.
				 *
				 * sequence.includes(geometry) → sequence
				 * geometry.includes(geometry) → bool
				 * **Example:** Is `point2` included within a 2000-meter circle around `point1`?
				 *
				 *     var point1 = r.point(-117.220406,32.719464);
				 *     var point2 = r.point(-117.206201,32.725186);
				 *     r.circle(point1, 2000).includes(point2).run(conn, callback);
				 *     // result returned to callback
				 *     true
				 *
				 * http://rethinkdb.com/api/javascript/includes
				 */
				includes(geometry: RGeometry<any>): this;
			}
			interface geometry {

			}
		}
		namespace intersects {
			interface stream {
				/**
				 * Tests whether two geometry objects intersect with one another. When applied to a sequence of geometry objects, `intersects` acts as a [filter](/api/javascript/filter), returning a sequence of objects from the sequence that intersect with the argument.
				 *
				 * sequence.intersects(geometry) → sequence
				 * geometry.intersects(geometry) → bool
				 r.intersects(sequence, geometry) → sequence
				 r.intersects(geometry, geometry) → bool
				 * **Example:** Is `point2` within a 2000-meter circle around `point1`?
				 *
				 *     var point1 = r.point(-117.220406,32.719464);
				 *     var point2 = r.point(-117.206201,32.725186);
				 *     r.circle(point1, 2000).intersects(point2).run(conn, callback);
				 *     // result returned to callback
				 *     true
				 *
				 * http://rethinkdb.com/api/javascript/intersects
				 */
				intersects(geometry: RGeometry<any>): this;
			}
			interface geometry {
				// TODO
			}
		}

		// sequence (all)
		interface avg<T> {
			/**
			 * Averages all the elements of a sequence. If called with a field name, averages all the values of that field in the sequence, skipping elements of the sequence that lack that field. If called with a function, calls that function on every element of the sequence and averages the results, skipping elements of the sequence where that function returns `null` or a non-existence error.
			 *
			 * sequence.avg([field | function]) → number
			 * **Example:** What's the average of 3, 5, and 7?
			 *
			 *     r.expr([3, 5, 7]).avg().run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/avg
			 */
			avg(): RNumber;
			avg(field: r.stringLike): RNumber;
			avg(func: (item: RObject<T>) => RNumber): RNumber;

			// TODO: is r.expr.avg functional?
		}
		interface contains<T> {
			/**
			 * Returns whether or not a sequence contains all the specified values, or if functions are provided instead, returns whether or not a sequence contains values matching all the specified functions.
			 *
			 * sequence.contains([value | predicate_function, ...]) → bool
			 * **Example:** Has Iron Man ever fought Superman?
			 *
			 *     r.table('marvel').get('ironman')('opponents').contains('superman').run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/contains
			 */
			contains(...functions_or_values: Array<((item: RValue<T> | RObject<T>) => r.rLike<T>) | string>): RBool;
			// TODO: could query for contains that is a partial T object
		}
		namespace count {
			interface sequence<T> {
				/**
				 * Count the number of elements in the sequence. With a single argument, count the number of elements equal to it. If the argument is a function, it is equivalent to calling filter before count.
				 *
				 * sequence.count([value | predicate_function]) → number
				 * binary.count() → number
				 * **Example:** Just how many super heroes are there?
				 *
				 *     r.table('marvel').count().add(r.table('dc').count()).run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/count
				 */
				count(predicate_function: FilterPredicate<T>): RNumber;
				count(equalTo: T): RNumber;
				count(): RNumber;
				// TODO: fix RGroupedStream
				// count<T extends RGroupedStream>(predicate_function:FilterPredicate<T>): this;
				// count<T extends RGroupedStream>(equalTo:T): this;
				// count<T extends RGroupedStream>(): this;
			}
			interface binary { // TODO: add
				/**
				 * Count the number of elements in the sequence. With a single argument, count the number of elements equal to it. If the argument is a function, it is equivalent to calling filter before count.
				 *
				 * sequence.count([value | predicate_function]) → number
				 * binary.count() → number
				 * **Example:** Just how many super heroes are there?
				 *
				 *     r.table('marvel').count().add(r.table('dc').count()).run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/count
				 */
				count(): RNumber;
			}
		}
		interface default_<T> {
			/**
			 * Provide a default value in case of non-existence errors. The `default` command evaluates its first argument (the value it's chained to). If that argument returns `null` or a non-existence error is thrown in evaluation, then `default` returns its second argument. The second argument is usually a default value, but it can be a function that returns a value.
			 *
			 * value.default(default_value | function) → any
			 * sequence.default(default_value | function) → any
			 * **Example:** Retrieve the titles and authors of the table `posts`. In the case where the author field is missing or `null`, we want to retrieve the string `Anonymous`.
			 *
			 *     r.table("posts").map(function (post) {
			 *         return {
			 *             title: post("title"),
			 *             author: post("author").default("Anonymous")
			 *         }
			 *     }).run(conn, callback);
			 *
			 * http://rethinkdb.com/api/javascript/default
			 */
			default(default_value: T | RValue<T> | RObject<T>): this;
			default(onError: (error: Error) => void): this;
		}
		interface forEach<T> {
			/**
			 * Loop over a sequence, evaluating the given write query for each element.
			 *
			 * sequence.forEach(write_function) → object
			 * **Example:** Now that our heroes have defeated their villains, we can safely remove them from the villain table.
			 *
			 *     r.table('marvel').forEach(function(hero) {
			 *         return r.table('villains').get(hero('villainDefeated')).delete()
			 *     }).run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/for_each
			 */
			forEach(write_function: (item: RValue<T> | RObject<T>) => RObject<WriteResult>): RObject<WriteResult>;
		}
		interface group<T> {
			/**
			 * Takes a stream and partitions it into multiple groups based on the fields or functions provided. Commands chained after `group` will be called on each of these grouped sub-streams, producing grouped data.
			 *
			 * sequence.group(field | function..., [{index: <indexname>, multi: false}]) → grouped_stream
			 * **Example:** What is each player's best game?
			 *
			 *     r.table('games').group('player').max('points').run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/group
			 */
			group<TGroup>(field: r.stringLike, options?: { index: string, multi?: boolean }): RGroupedStream<TGroup>;
			group<TGroup>(field: r.stringLike, field2: r.stringLike, options?: { index: string, multi?: boolean }): RGroupedStream<TGroup>;
			group<TGroup>(field: r.stringLike, field2: r.stringLike, field3: r.stringLike, options?: { index: string, multi?: boolean }): RGroupedStream<TGroup>;
			group<TGroup>(field: r.stringLike, field2: r.stringLike, field3: r.stringLike, field4: r.stringLike, options?: { index: string, multi?: boolean }): RGroupedStream<TGroup>;

			group<TGroup>(grouping: r.arrayLike<TGroup>, options?: { index: string, multi?: boolean }): RGroupedStream<RArray<TGroup>>;
			group<TGroup>(aggregation_function: (item: RValue<T> | RObject<T>) => TGroup, options?: { index?, multi?}): RGroupedStream<TGroup>;
			group(options: { index: string, multi?: boolean }): RGroupedStream<T>;
		}
		interface isEmpty {
			/**
			 * Test if a sequence is empty.
			 *
			 * sequence.isEmpty() → bool
			 * **Example:** Are there any documents in the marvel table?
			 *
			 *     r.table('marvel').isEmpty().run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/is_empty
			 */
			isEmpty(): RBool;
		}
		interface max<T> {
			/**
			 * Finds the maximum element of a sequence.
			 *
			 * sequence.max(field | function) → element
			 * sequence.max({index: <indexname>}) → element
			 * **Example:** Return the maximum value in the list `[3, 5, 7]`.
			 *
			 *     r.expr([3, 5, 7]).max().run(conn, callback);
			 *
			 * http://rethinkdb.com/api/javascript/max
			 */
			max<TOut extends Object>(field_or_a_function: r.stringLike | ((item: RValue<T> | RObject<T>) => RNumber)): RObject<TOut>;
			max<TOut extends number>(field_or_a_function: r.stringLike | ((item: RValue<T> | RObject<T>) => RNumber)): RNumber;
			max<TOut extends string>(field_or_a_function: r.stringLike | ((item: RValue<T> | RObject<T>) => RNumber)): RString;
			max<TOut extends Array<any>>(field_or_a_function: r.stringLike | ((item: RValue<T> | RObject<T>) => RNumber)): RArray<TOut>;
			max<TOut>(field_or_a_function: r.stringLike | ((item: RValue<T> | RObject<T>) => RNumber)): RValue<TOut>;

			max<TOut extends Object>(options?: { index: string }): RObject<TOut>;
			max<TOut extends number>(options?: { index: string }): RNumber;
			max<TOut extends string>(options?: { index: string }): RString;
			max<TOut extends Array<any>>(options?: { index: string }): RArray<TOut>;
			max<TOut>(options?: { index: string }): RValue<TOut>;
		}
		interface min<T> {
			/**
			 * Finds the minimum element of a sequence.
			 *
			 * sequence.min(field | function) → element
			 * sequence.min({index: <indexname>}) → element
			 * **Example:** Return the minimum value in the list `[3, 5, 7]`.
			 *
			 *     r.expr([3, 5, 7]).min().run(conn, callback);
			 *
			 * http://rethinkdb.com/api/javascript/min
			 */
			min<TOut extends Object>(field_or_a_function: r.stringLike | ((item: RValue<T> | RObject<T>) => RNumber)): RObject<TOut>;
			min<TOut extends number>(field_or_a_function: r.stringLike | ((item: RValue<T> | RObject<T>) => RNumber)): RNumber;
			min<TOut extends string>(field_or_a_function: r.stringLike | ((item: RValue<T> | RObject<T>) => RNumber)): RString;
			min<TOut extends Array<any>>(field_or_a_function: r.stringLike | ((item: RValue<T> | RObject<T>) => RNumber)): RArray<TOut>;
			min<TOut>(field_or_a_function: r.stringLike | ((item: RValue<T> | RObject<T>) => RNumber)): RValue<TOut>;

			min<TOut extends Object>(options?: { index: string }): RObject<TOut>;
			min<TOut extends number>(options?: { index: string }): RNumber;
			min<TOut extends string>(options?: { index: string }): RString;
			min<TOut extends Array<any>>(options?: { index: string }): RArray<TOut>;
			min<TOut>(options?: { index: string }): RValue<TOut>;
			// TODO: do we need more `extends` ?
		}
		namespace nth {
			interface sequence {
				/**
				 * Get the _nth_ element of a sequence, counting from zero. If the argument is negative, count from the last element.
				 *
				 * sequence.nth(index) → object
				 * selection.nth(index) → selection
				 * **Example:** Select the second element in the array.
				 *
				 *     r.expr([1,2,3]).nth(1).run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/nth
				 */
				nth<TOut extends Object>(index: r.numberLike): RObject<TOut>;
				nth<TOut extends number>(index: r.numberLike): RNumber;
				nth<TOut extends string>(index: r.numberLike): RString;
				nth<TOut extends Array<any>>(index: r.numberLike): RArray<TOut>;
				nth<TOut>(index: r.numberLike): RValue<TOut>;
			}
			interface selection<T> {
				/**
				 * Get the _nth_ element of a sequence, counting from zero. If the argument is negative, count from the last element.
				 *
				 * sequence.nth(index) → object
				 * selection.nth(index) → selection
				 * **Example:** Select the second element in the array.
				 *
				 *     r.expr([1,2,3]).nth(1).run(conn, callback)
				 *
				 * http://rethinkdb.com/api/javascript/nth
				 */
				nth(index: r.numberLike): RSelection<T>;
			}
		}
		interface offsetsOf<T> {
			/**
			 * Get the indexes of an element in a sequence.
			 * If the argument is a predicate, get the indexes of all elements matching it.
			 *
			 * sequence.offsetsOf(datum | predicate_function) → array
			 * **Example:** Find the position of the letter 'c'.
			 *
			 *     r.expr(['a','b','c']).offsetsOf('c').run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/offsets_of
			 */
			offsetsOf(predicate_function: (item: RValue<T> | RObject<T>) => RBool): RArray<number>;
			offsetsOf(datum: r.stringLike): RArray<number>;
		}

		type ReductionFunction<T, TOut> = (left: RValue<T> | RObject<T>, right: RValue<T> | RObject<T>) => TOut;

		interface reduce<T> {
			/**
			 * Produce a single value from a sequence through repeated application of a reduction function.
			 *
			 * sequence.reduce(function) → value
			 * **Example:** Return the number of documents in the table `posts.
			 *
			 *     r.table("posts").map(function(doc) {
			 *         return 1
			 *     }).reduce(function(left, right) {
			 *         return left.add(right)
			 *     }).run(conn, callback);
			 *
			 * http://rethinkdb.com/api/javascript/reduce
			 */
			reduce<TOut extends number>(reduce_function: ReductionFunction<T, TOut>): RNumber;
			reduce<TOut extends string>(reduce_function: ReductionFunction<T, TOut>): RString;
			reduce<TOut extends Array<any>>(reduce_function: ReductionFunction<T, TOut>): RArray<TOut>;
			reduce<TOut extends Object>(reduce_function: ReductionFunction<T, TOut>): RObject<TOut>;
			reduce<TOut>(reduce_function: ReductionFunction<T, TOut>): RValue<TOut>;
			// TODO: do we need more `extends` ?
		}
		interface sum<T> {
			/**
			 * Sums all the elements of a sequence. If called with a field name, sums all the values of that field in the sequence, skipping elements of the sequence that lack that field. If called with a function, calls that function on every element of the sequence and sums the results, skipping elements of the sequence where that function returns `null` or a non-existence error.
			 *
			 * sequence.sum([field | function]) → number
			 * **Example:** What's 3 + 5 + 7?
			 *
			 *     r.expr([3, 5, 7]).sum().run(conn, callback)
			 *
			 * http://rethinkdb.com/api/javascript/sum
			 */
			sum(field_or_a_function?: r.stringLike | ((item: RValue<T> | RObject<T>) => RNumber)): RNumber;
		}

		// value
		interface operators<T> {
			/**
			 * Test if two or more values are equal.
			 *
			 * value.eq(value[, value, ...]) → bool
			 * **Example:** See if a user's `role` field is set to `administrator`.
			 *
			 *     r.table('users').get(1)('role').eq('administrator').run(conn, callback);
			 *
			 * http://rethinkdb.com/api/javascript/eq
			 */
			eq(value: this | T | string | number, ...values: Array<this | T | string | number>): RBool;
			eq(value: this | T | string | number): RBool;

			/**
			 * Compare values, testing if the left-hand value is greater than or equal to the right-hand.
			 *
			 * value.ge(value[, value, ...]) → bool
			 * **Example:** Test if a player has scored 10 points or more.
			 *
			 *     r.table('players').get(1)('score').ge(10).run(conn, callback);
			 *
			 * http://rethinkdb.com/api/javascript/ge
			 */
			ge(value: this | T | string | number, ...values: Array<this | T | string | number>): RBool;
			ge(value: this | T | string | number): RBool;

			/**
			 * Compare values, testing if the left-hand value is greater than the right-hand.
			 *
			 * value.gt(value[, value, ...]) → bool
			 * **Example:** Test if a player has scored more than 10 points.
			 *
			 *     r.table('players').get(1)('score').gt(10).run(conn, callback);
			 *
			 * http://rethinkdb.com/api/javascript/gt
			 */
			gt(value: this | T | string | number, ...values: Array<this | T | string | number>): RBool;
			gt(value: this | T | string | number): RBool;

			/**
			 * Compare values, testing if the left-hand value is less than or equal to the right-hand.
			 *
			 * value.le(value[, value, ...]) → bool
			 * **Example:** Test if a player has scored 10 points or less.
			 *
			 *     r.table('players').get(1)('score').le(10).run(conn, callback);
			 *
			 * http://rethinkdb.com/api/javascript/le
			 */
			le(value: this | T | string | number, ...values: Array<this | T | string | number>): RBool;
			le(value: this | T | string | number): RBool;

			/**
			 * Compare values, testing if the left-hand value is less than the right-hand.
			 *
			 * value.lt(value[, value, ...]) → bool
			 * **Example:** Test if a player has scored less than 10 points.
			 *
			 *     r.table('players').get(1)['score'].lt(10).run(conn, callback);
			 *
			 * http://rethinkdb.com/api/javascript/lt
			 */
			lt(value: this | T | string | number, ...values: Array<this | T | string | number>): RBool;
			lt(value: this | T | string | number): RBool;

			/**
			 * Test if two or more values are not equal.
			 *
			 * value.ne(value[, value, ...]) → bool
			 * **Example:** See if a user's `role` field is not set to `administrator`.
			 *
			 *     r.table('users').get(1)('role').ne('administrator').run(conn, callback);
			 *
			 * http://rethinkdb.com/api/javascript/ne
			 */
			ne(value: this | T | string | number, ...values: Array<this | T | string | number>): RBool;
			ne(value: this | T | string | number): RBool;
		}
	}
	export interface RGeometry<RemoteT> extends RValue<RemoteT> {
		/**
		 * Compute the distance between a point and another geometry object. At least one of the geometry objects specified must be a point.
		 *
		 * geometry.distance(geometry[, {geoSystem: 'WGS84', unit: 'm'}]) → number
		 * r.distance(geometry, geometry[, {geoSystem: 'WGS84', unit: 'm'}]) → number
		 * **Example:** Compute the distance between two points on the Earth in kilometers.
		 *
		 *     var point1 = r.point(-122.423246,37.779388);
		 *     var point2 = r.point(-117.220406,32.719464);
		 *     r.distance(point1, point2, {unit: 'km'}).run(conn, callback);
		 *     // result returned to callback
		 *     734.1252496021841
		 *
		 * http://rethinkdb.com/api/javascript/distance
		 */
		distance(geometry, options?: { geoSystem?, unit?}): RNumber;

		/**
		 * Tests whether a geometry object is completely contained within another. When applied to a sequence of geometry objects, `includes` acts as a [filter](/api/javascript/filter), returning a sequence of objects from the sequence that include the argument.
		 *
		 * sequence.includes(geometry) → sequence
		 * geometry.includes(geometry) → bool
		 * **Example:** Is `point2` included within a 2000-meter circle around `point1`?
		 *
		 *     var point1 = r.point(-117.220406,32.719464);
		 *     var point2 = r.point(-117.206201,32.725186);
		 *     r.circle(point1, 2000).includes(point2).run(conn, callback);
		 *     // result returned to callback
		 *     true
		 *
		 * http://rethinkdb.com/api/javascript/includes
		 */
		includes(geometry): RBool;

		/**
		 * Tests whether two geometry objects intersect with one another. When applied to a sequence of geometry objects, `intersects` acts as a [filter](/api/javascript/filter), returning a sequence of objects from the sequence that intersect with the argument.
		 *
		 * sequence.intersects(geometry) → sequence
		 * geometry.intersects(geometry) → bool
		 * r.intersects(sequence, geometry) → sequence
		 * r.intersects(geometry, geometry) → bool
		 * **Example:** Is `point2` within a 2000-meter circle around `point1`?
		 *
		 *     var point1 = r.point(-117.220406,32.719464);
		 *     var point2 = r.point(-117.206201,32.725186);
		 *     r.circle(point1, 2000).intersects(point2).run(conn, callback);
		 *     // result returned to callback
		 *     true
		 *
		 * http://rethinkdb.com/api/javascript/intersects
		 */
		intersects(geometry): RBool;

		/**
		 * Convert a ReQL geometry object to a [GeoJSON][] object.
		 *
		 * geometry.toGeojson() → object
		 * **Example:** Convert a ReQL geometry object to a GeoJSON object.
		 *
		 *     r.table('geo').get('sfo')('location').toGeojson.run(conn, callback);
		 *     // result passed to callback
		 *     {
		 *         'type': 'Point',
		 *         'coordinates': [ -122.423246, 37.779388 ]
		 *     }
		 *
		 * http://rethinkdb.com/api/javascript/to_geojson
		 */
		toGeojson(): RObject<any>;
	}

	export interface RPolygon extends RGeometry<Array<Array<r.numberLike>>> {
		/**
		 * Use `polygon2` to "punch out" a hole in `polygon1`. `polygon2` must be completely contained within `polygon1` and must have no holes itself (it must not be the output of `polygonSub` itself).
		 *
		 * polygon1.polygonSub(polygon2) → polygon
		 * **Example:** Define a polygon with a hole punched in it.
		 *
		 *     var outerPolygon = r.polygon(
		 *         [-122.4,37.7],
		 *         [-122.4,37.3],
		 *         [-121.8,37.3],
		 *         [-121.8,37.7]
		 *     );
		 *     var innerPolygon = r.polygon(
		 *         [-122.3,37.4],
		 *         [-122.3,37.6],
		 *         [-122.0,37.6],
		 *         [-122.0,37.4]
		 *     );
		 *     outerPolygon.polygonSub(innerpolygon).run(conn, callback);
		 *
		 * http://rethinkdb.com/api/javascript/polygon_sub
		 */
		polygonSub(polygon2: RPolygon): RPolygon;
	}

	export interface RLine extends RGeometry<Array<r.numberLike>> {
		/**
		 * Convert a Line object into a Polygon object. If the last point does not specify the same coordinates as the first point, `polygon` will close the polygon by connecting them.
		 *
		 * line.fill() → polygon
		 * **Example:** Create a line object and then convert it to a polygon.
		 *
		 *     r.table('geo').insert({
		 *         id: 201,
		 *         rectangle: r.line(
		 *             [-122.423246,37.779388],
		 *             [-122.423246,37.329898],
		 *             [-121.886420,37.329898],
		 *             [-121.886420,37.779388]
		 *         )
		 *     }).run(conn, callback);
		 *
		 *     r.table('geo').get(201).update({
		 *         rectangle: r.row('rectangle').fill()
		 *     }, {nonAtomic: true}).run(conn, callback);
		 *
		 * http://rethinkdb.com/api/javascript/fill
		 */
		fill(): RPolygon;
	}

	export interface RPoint extends
		RGeometry<Object>
	{ }

	export interface RGroupedStream<RemoteT> extends RStream<GroupResult<RemoteT>> { //, RValue<RCursor<GroupResult>>

		/**
		 * Takes a grouped stream or grouped data and turns it into an array of objects representing the groups. Any commands chained after `ungroup` will operate on this array, rather than operating on each group individually. This is useful if you want to e.g. order the groups by the value of their reduction.
		 *
		 * grouped_stream.ungroup() → array
		 * grouped_data.ungroup() → array
		 * **Example:** What is the maximum number of points scored by each player, with the highest scorers first?
		 *
		 *     r.table('games')
		 *         .group('player').max('points')['points']
		 *         .ungroup().orderBy(r.desc('reduction')).run(conn)
		 *
		 * http://rethinkdb.com/api/javascript/ungroup
		 */
		ungroup(): RArray<GroupResult<RemoteT>>;
	}

	export interface RObservable<RemoteT> {
		/**
		 * Return a changefeed, an infinite stream of objects representing changes to a query. A changefeed may return changes to a table or an individual document (a "point" changefeed), and document transformation commands such as `filter` or `map` may be used before the `changes` command to affect the output.
		 *
		 * stream.changes([options]) → stream
		 * singleSelection.changes([options]) → stream
		 * **Example:** Subscribe to the changes on a table.
		 *
		 *     r.table('games').changes().run(conn, function(err, cursor) {
		 *       cursor.each(console.log)
		 *     })
		 *
		 * http://rethinkdb.com/api/javascript/changes
		 */
		changes(options?: { squash?: boolean | number, changefeedQueueSize?: number, includeInitial?: boolean, includeStates?: boolean }): RStream<ChangesResult<RemoteT>>;
	}
	export interface ROperations<T> extends RAny {
		/**
		 * Delete one or more documents from a table.
		 *
		 * table.delete([{durability: "hard", returnChanges: false}])→ objectselection.delete([{durability: "hard", returnChanges: false}])→ objectsingleSelection.delete([{durability: "hard", returnChanges: false}])→ object
		 * **Example:** Delete a single document from the table `comments`.
		 *
		 *     r.table("comments").get("7eab9e63-73f1-4f33-8ce4-95cbea626f59").delete().run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/delete
		 */
		delete(options?: WriteOptions): RObject<WriteResult>;

		/**
		 * Insert JSON documents into a table. Accepts a single JSON document or an array of documents.
		 *
		 * table.insert(object | [object1, object2, ...][, {durability: "hard", returnChanges: false, conflict: "error"}]) → object
		 * **Example:** Insert a document into the table `posts`.
		 *
		 *     r.table("posts").insert({
		 *         id: 1,
		 *         title: "Lorem ipsum",
		 *         content: "Dolor sit amet"
		 *     }).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/insert
		 */
		insert(...objects_and_then_options: Array<T | InsertOptions>): RObject<WriteResult>;
		insert(...objects: Array<T>): RObject<WriteResult>;
		insert(object: T, options?: InsertOptions): RObject<WriteResult>;

		/**
		 * Replace documents in a table. Accepts a JSON document or a ReQL expression, and replaces the original document with the new one. The new document must have the same primary key as the original document.
		 *
		 * table.replace(object | function[, {durability: "hard", returnChanges: false, nonAtomic: false}])→ object
		 * selection.replace(object | function[, {durability: "hard", returnChanges: false, nonAtomic: false}])→ object
		 * singleSelection.replace(object | function[, {durability: "hard", returnChanges: false, nonAtomic: false}])→ object
		 * **Example:** Replace the document with the primary key `1`.
		 *
		 *     r.table("posts").get(1).replace({
		 *         id: 1,
		 *         title: "Lorem ipsum",
		 *         content: "Aleas jacta est",
		 *         status: "draft"
		 *     }).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/replace
		 */
		replace(object_or_a_function: ((item: RValue<T> | RObject<T>) => T) | T, options?: WriteOptions): RObject<WriteResult>;

		/**
		 * Update JSON documents in a table. Accepts a JSON document, a ReQL expression, or a combination of the two. You can pass options like `returnChanges` that will return the old and new values of the row you have modified.
		 *
		 * table.update(object | function[, {durability: "hard", returnChanges: false, nonAtomic: false}])→ objectselection.update(object | function[, {durability: "hard", returnChanges: false, nonAtomic: false}])→ objectsingleSelection.update(object | function[, {durability: "hard", returnChanges: false, nonAtomic: false}])→ object
		 * **Example:** Update the status of the post with `id` of `1` to `published`.
		 *
		 *     r.table("posts").get(1).update({status: "published"}).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/update
		 */
		update(object_or_a_function: ((item: RValue<T> | RObject<T>) => T) | T, options?: WriteOptions): RObject<WriteResult>;
	}

	export interface R extends
		RDb,
		RExpression,
		r.map.r {
		/**
		 * `r.args` is a special term that's used to splice an array of arguments into another term. This is useful when you want to call a variadic term such as `getAll` with a set of arguments produced at runtime.
		 *
		 * This is analogous to using **apply** in JavaScript.
		 *
		 * r.args(array) → special
		 * **Example:** Get Alice and Bob from the table `people`.
		 *
		 *     r.table('people').getAll('Alice', 'Bob').run(conn, callback)
		 *     // or
		 *     r.table('people').getAll(r.args(['Alice', 'Bob'])).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/args
		 */
		args(array: r.arrayLike<any>): RSpecial;

		/**
		 * Encapsulate binary data within a query.
		 *
		 * r.binary(data) → binary
		 * **Example:** Save an avatar image to a existing user record.
		 *
		 *     var fs = require('fs');
		 *     fs.readFile('./defaultAvatar.png', function (err, avatarImage) {
		*         if (err) {
		*             // Handle error
		*         }
		*         else {
		*             r.table('users').get(100).update({
		*                 avatar: avatarImage
		*             })
		*         }
		*     });
		 *
		 * http://rethinkdb.com/api/javascript/binary
		 */
		binary(data: any): RBinary;

		/**
		 * Perform a branching conditional equivalent to `if-then-else`.
		 *
		 * The `branch` command takes 2n+1 arguments: pairs of conditional expressions and commands to be executed if the conditionals return any value but `false` or `null` (i.e., "truthy" values), with a final "else" command to be evaluated if all of the conditionals are `false` or `null`.
		 *
		 * r.branch(test, true_action[, test2, else_action, ...], false_action) → any
		 * **Example:** Test the value of x.
		 *
		 *     var x = 10;
		 *     r.branch(r.expr(x).gt(5), 'big', 'small').run(conn, callback);
		 *     // Result passed to callback
		 *     "big"
		 *
		 * http://rethinkdb.com/api/javascript/branch
		 */
		branch<T extends string, R extends RString>(test: RBool, true_action: T | R, false_action: T | R): RString;
		branch<T extends boolean, R extends RBool>(test: RBool, true_action: T | R, false_action: T | R): RBool;
		branch<T extends number, R extends RNumber>(test: RBool, true_action: T | R, false_action: T | R): RNumber;
		branch<T extends Array<any>, R extends RArray<any>>(test: RBool, true_action: T | R, false_action: T | R): R;
		branch<T extends Date, R extends RTime>(test: RBool, true_action: T | R, false_action: T | R): RTime;
		branch<T extends Object, R extends RObject<any>>(test: RBool, true_action: T | R, false_action: T | R): R;

		branch<T extends string, R extends RString>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, false_action: T | R): RString;
		branch<T extends boolean, R extends RBool>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, false_action: T | R): RBool;
		branch<T extends number, R extends RNumber>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, false_action: T | R): RNumber;
		branch<T extends Array<any>, R extends RArray<any>>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, false_action: T | R): R;
		branch<T extends Date, R extends RTime>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, false_action: T | R): RTime;
		branch<T extends Object, R extends RObject<any>>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, false_action: T | R): R;

		branch<T extends string, R extends RString>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, test3: RBool, true_action3: T | R, false_action: T | R): RString;
		branch<T extends boolean, R extends RBool>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, test3: RBool, true_action3: T | R, false_action: T | R): RBool;
		branch<T extends number, R extends RNumber>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, test3: RBool, true_action3: T | R, false_action: T | R): RNumber;
		branch<T extends Array<any>, R extends RArray<any>>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, test3: RBool, true_action3: T | R, false_action: T | R): R;
		branch<T extends Date, R extends RTime>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, test3: RBool, true_action3: T | R, false_action: T | R): RTime;
		branch<T extends Object, R extends RObject<any>>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, test3: RBool, true_action3: T | R, false_action: T | R): R;

		branch<T extends string, R extends RString>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, test3: RBool, true_action3: T | R, test4: RBool, true_action4: T | R, false_action: T | R): RString;
		branch<T extends boolean, R extends RBool>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, test3: RBool, true_action3: T | R, test4: RBool, true_action4: T | R, false_action: T | R): RBool;
		branch<T extends number, R extends RNumber>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, test3: RBool, true_action3: T | R, test4: RBool, true_action4: T | R, false_action: T | R): RNumber;
		branch<T extends Array<any>, R extends RArray<any>>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, test3: RBool, true_action3: T | R, test4: RBool, true_action4: T | R, false_action: T | R): R;
		branch<T extends Date, R extends RTime>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, test3: RBool, true_action3: T | R, test4: RBool, true_action4: T | R, false_action: T | R): RTime;
		branch<T extends Object, R extends RObject<any>>(test: RBool, true_action: T | R, test2: RBool, true_action2: T | R, test3: RBool, true_action3: T | R, test4: RBool, true_action4: T | R, false_action: T | R): R;

		/**
		 * Rounds the given value up, returning the smallest integer value greater than or equal to the given value (the value's ceiling).
		 *
		 * r.ceil(number) → numbernumber.ceil() → number
		 * **Example:** Return the ceiling of 12.345.
		 *
		 *     > r.ceil(12.345).run(conn, callback);
		 *
		 *     13.0
		 *
		 * http://rethinkdb.com/api/javascript/ceil
		 */
		ceil(number: r.numberLike): RNumber;

		/**
		 * Construct a circular line or polygon. A circle in RethinkDB is a polygon or line _approximating_ a circle of a given radius around a given center, consisting of a specified number of vertices (default 32).
		 *
		 * r.circle([longitude, latitude], radius[, {numVertices: 32, geoSystem: 'WGS84', unit: 'm', fill: true}]) → geometry
		 * r.circle(point, radius[, {numVertices: 32, geoSystem: 'WGS84', unit: 'm', fill: true}]) → geometry
		 * **Example:** Define a circle.
		 *
		 *     r.table('geo').insert({
		*         id: 300,
		*         name: 'Hayes Valley',
		*         neighborhood: r.circle([-122.423246,37.779388], 1000)
		*     }).run(conn, callback);
		 *
		 * http://rethinkdb.com/api/javascript/circle
		 */
		// TODO: return values for geometry?
		circle(longitudeAndlatitude: Array<r.numberLike> | RArray<number>, radius: r.numberLike, options?: { numVertices?, geoSystem?, unit?, fill?}): RGeometry<any>;
		circle(longitudeAndlatitude: Array<r.numberLike> | RArray<number>, radius: r.numberLike): RGeometry<any>;
		circle(point: RPoint, radius: r.numberLike, options?: { numVertices?, geoSystem?, unit?, fill?}): RGeometry<any>;
		circle(point: RPoint, radius: r.numberLike): RGeometry<any>;

		/**
		 * Create a new connection to the database server.
		 *
		 * r.connect(options, callback)r.connect(host, callback)r.connect(options) → promiser.connect(host) → promise
		 * **Example:** Open a connection using the default host and port, specifying the default database.
		 *
		 *     r.connect({
		*         db: 'marvel'
		*     }, function(err, conn) {
		*         // ...
		*     });
		 *
		 * If no callback is provided, a promise will be returned.
		 *
		 *     var promise = r.connect({db: 'marvel'});
		 *
		 * http://rethinkdb.com/api/javascript/connect
		 */
		connect(options: RConnectionOptions, callback: (err: Error, conn: RConnection) => void): void;
		connect(host: r.stringLike, callback: (err: Error, conn: RConnection) => void): void;
		connect(options: RConnectionOptions): Promise<RConnection>;
		connect(host: r.stringLike): Promise<RConnection>;

		/**
		 * Reference a database.
		 *
		 * r.db(dbName) → db
		 * **Example:** Explicitly specify a database for a query.
		 *
		 *     r.db('heroes').table('marvel').run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/db
		 */
		db(dbName: r.stringLike): RDb;

		/**
		 * Create a database. A RethinkDB database is a collection of tables, similar to relational databases.
		 *
		 * If successful, the operation returns an object: `{created: 1}`. If a database with the same name already exists the operation throws `ReqlRuntimeError`.
		 *
		 * Note: that you can only use alphanumeric characters and underscores for the database name.
		 *
		 * r.dbCreate(dbName) → object
		 * **Example:** Create a database named 'superheroes'.
		 *
		 *     r.dbCreate('superheroes').run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/db_create
		 */
		dbCreate(dbName: r.stringLike): RObject<CreateResult>;

		/**
		 * Drop a database. The database, all its tables, and corresponding data will be deleted.
		 *
		 * If successful, the operation returns the object `{dropped: 1}`. If the specified database doesn't exist a `ReqlRuntimeError` is thrown.
		 *
		 * r.dbDrop(dbName) → object
		 * **Example:** Drop a database named 'superheroes'.
		 *
		 *     r.dbDrop('superheroes').run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/db_drop
		 */
		dbDrop(dbName: r.stringLike): RObject<DropResult>;

		/**
		 * List all database names in the system. The result is a list of strings.
		 *
		 * r.dbList() → array
		 * **Example:** List all databases.
		 *
		 *     r.dbList().run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/db_list
		 */
		dbList(): RArray<string>;

		/**
		 * To specify the ordering, wrap the attribute with either r.asc or r.desc (defaults to ascending).
		 */
		desc<T>(func: T): T;

		/**
		 * To specify the ordering, wrap the attribute with either r.asc or r.desc (defaults to ascending).
		 */
		asc<T>(func: T): T;

		/**
		 * Create a time object based on seconds since epoch. The first argument is a double and will be rounded to three decimal places (millisecond-precision).
		 *
		 * r.epochTime(epochTime) → time
		 * **Example:** Update the birthdate of the user "John" to November 3rd, 1986.
		 *
		 *     r.table("user").get("John").update({birthdate: r.epochTime(531360000)})
		 *         .run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/epoch_time
		 */
		epochTime(epochTime: r.numberLike): RTime;

		/**
		 * Throw a runtime error. If called with no arguments inside the second argument to `default`, re-throw the current error.
		 *
		 * r.error(message) → error
		 * **Example:** Iron Man can't possibly have lost a battle:
		 *
		 *     r.table('marvel').get('IronMan').do(function(ironman) {
		*         return r.branch(ironman('victories').lt(ironman('battles')),
		*             r.error('impossible code path'),
		*             ironman)
		*     }).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/error
		 */
		error(message: r.stringLike): Error;

		/**
		 * Construct a ReQL JSON object from a native object.
		 *
		 * r.expr(value) → value
		 * **Example:** Objects wrapped with `expr` can then be manipulated by ReQL API functions.
		 *
		 *     r.expr({a:'b'}).merge({b:[1,2,3]}).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/expr
		 */
		expr(value): RValue<any>;
		expr<T extends RNumber>(value): RNumber;
		expr<T extends RString>(value): RString;
		expr<T extends RArray<any>>(value): T;
		expr<T extends RBool>(value): RBool;
		expr<T extends RTime>(value): RTime;
		expr<T extends RObject<any>>(value): T;
		expr<T extends number>(value): RNumber;
		expr<T extends string>(value): RString;
		expr<T extends Array<any>>(value): RArray<any>;
		expr<T extends boolean>(value): RBool;
		expr<T extends Date>(value): RTime;
		expr<T>(value): RObject<T>;

		/**
		 * Rounds the given value down, returning the largest integer value less than or equal to the given value (the value's floor).
		 *
		 * r.floor(number) → numbernumber.floor() → number
		 * **Example:** Return the floor of 12.345.
		 *
		 *     > r.floor(12.345).run(conn, callback);
		 *
		 *     12.0
		 *
		 * http://rethinkdb.com/api/javascript/floor
		 */
		floor(number: r.numberLike): RNumber;

		/**
		 * Convert a [GeoJSON](http://geojson.org) object to a ReQL geometry object.
		 *
		 * r.geojson(geojson) → geometry
		 * **Example:** Convert a GeoJSON object to a ReQL geometry object.
		 *
		 *     var geoJson = {
		*         'type': 'Point',
		*         'coordinates': [ -122.423246, 37.779388 ]
		*     };
		 *     r.table('geo').insert({
		*         id: 'sfo',
		*         name: 'San Francisco',
		*         location: r.geojson(geoJson)
		*     }).run(conn, callback);
		 *
		 * http://rethinkdb.com/api/javascript/geojson
		 */
		geojson(geojson: Object | RObject<any>): RGeometry<Object>;

		/**
		 * Compute the distance between a point and another geometry object. At least one of the geometry objects specified must be a point.
		 *
		 * geometry.distance(geometry[, {geoSystem: 'WGS84', unit: 'm'}]) → number
		 * r.distance(geometry, geometry[, {geoSystem: 'WGS84', unit: 'm'}]) → number
		 * **Example:** Compute the distance between two points on the Earth in kilometers.
		 *
		 *     var point1 = r.point(-122.423246,37.779388);
		 *     var point2 = r.point(-117.220406,32.719464);
		 *     r.distance(point1, point2, {unit: 'km'}).run(conn, callback);
		 *     // result returned to callback
		 *     734.1252496021841
		 *
		 * http://rethinkdb.com/api/javascript/distance
		 */
		distance(geometry1: RGeometry<any>, geometry2: RGeometry<any>, options?: { geoSystem?, unit?}): RNumber;

		/**
		 * Retrieve data from the specified URL over HTTP. The return type depends on the `resultFormat` option, which checks the `Content-Type` of the response by default.
		 *
		 * r.http(url [, options]) → value
		 * **Example:** Perform a simple HTTP `GET` request, and store the result in a table.
		 *
		 *     r.table('posts').insert(r.http('http://httpbin.org/get')).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/http
		 */
		http<T extends Object>(url: r.stringLike, options?: { timeout: number, reattempts: number, redirects: number, verify: boolean, resultFormat: string }): RObject<T>
		http<T extends string>(url: r.stringLike, options?: { timeout: number, reattempts: number, redirects: number, verify: boolean, resultFormat: string }): RString
		http<T extends boolean>(url: r.stringLike, options?: { timeout: number, reattempts: number, redirects: number, verify: boolean, resultFormat: string }): RBool
		http<T extends Array<any>>(url: r.stringLike, options?: { timeout: number, reattempts: number, redirects: number, verify: boolean, resultFormat: string }): RArray<any>
		http<T extends number>(url: r.stringLike, options?: { timeout: number, reattempts: number, redirects: number, verify: boolean, resultFormat: string }): RNumber
		http<T extends Date>(url: r.stringLike, options?: { timeout: number, reattempts: number, redirects: number, verify: boolean, resultFormat: string }): RTime

		/**
		 * Create a time object based on an ISO 8601 date-time string (e.g. '2013-01-01T01:01:01+00:00'). We support all valid ISO 8601 formats except for week dates. If you pass an ISO 8601 date-time without a time zone, you must specify the time zone with the `defaultTimezone` argument. Read more about the ISO 8601 format at [Wikipedia](http://en.wikipedia.org/wiki/ISO_8601).
		 *
		 * r.ISO8601(iso8601Date[, {defaultTimezone:''}]) → time
		 * **Example:** Update the time of John's birth.
		 *
		 *     r.table("user").get("John").update({birth: r.ISO8601('1986-11-03T08:30:00-07:00')}).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/iso8601
		 */
		ISO8601(iso8601Date: r.stringLike, options?: { defaultTimezone?: r.stringLike }): RTime;

		/**
		 * Create a javascript expression.
		 *
		 * r.js(jsString[, {timeout: <number>}]) → value</number>
		 * **Example:** Concatenate two strings using JavaScript.
		 *
		 *     r.js("'str1' + 'str2'").run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/js
		 */
		js(jsString: r.stringLike, options?: { timeout?: r.numberLike }): RValue<any>;
		js(jsString: r.stringLike): RValue<any>;

		/**
		 * Parse a JSON string on the server.
		 *
		 * r.json(json_string) → value
		 * **Example:** Send an array to the server.
		 *
		 *     r.json("[1,2,3]").run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/json
		 */
		json<T extends Object>(json_string: r.stringLike): RObject<T>;
		json<T>(json_string: r.stringLike): RValue<T>;
		// TODO: add more... <T>

		/**
		 * Construct a geometry object of type Line. The line can be specified in one of two ways:
		 *
		 * *   Two or more two-item arrays, specifying longitude and latitude numbers of the line's vertices;
		 * *   Two or more [Point](/api/javascript/point) objects specifying the line's vertices.
		 *
		 * r.line([lon1, lat1], [lon2, lat1], ...) → liner.line(point1, point2, ...) → line
		 * **Example:** Define a line.
		 *
		 *     r.table('geo').insert({
		*         id: 101,
		*         route: r.line([-122.423246,37.779388], [-121.886420,37.329898])
		*     }).run(conn, callback);
		 *
		 * http://rethinkdb.com/api/javascript/line
		 */
		line(...lonAndLat: Array<Array<r.numberLike>>): RLine;
		line(...points): RLine;

		/**
		 * Replace an object in a field instead of merging it with an existing object in a `merge` or `update` operation.
		 *
		 * `js r.table('users').get(1).update({ data: r.literal({ age: 19, job: 'Engineer' }) }).run(conn, callback)`
		 *
		 * r.literal(object) → special
		 *
		 *
		 * http://rethinkdb.com/api/javascript/literal
		 */
		literal(object: Object): RSpecial;

		/**
		 * Return a time object representing the current time in UTC. The command now() is computed once when the server receives the query, so multiple instances of r.now() will always return the same time inside a query.
		 *
		 * r.now() → time
		 * **Example:** Add a new user with the time at which he subscribed.
		 *
		 *     r.table("users").insert({
		*         name: "John",
		*         subscription_date: r.now()
		*     }).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/now
		 */
		now(): RTime;

		/**
		 * Creates an object from a list of key-value pairs, where the keys must be strings. `r.object(A, B, C, D)` is equivalent to `r.expr([[A, B], [C, D]]).coerce_to('OBJECT')`.
		 *
		 * r.object([key, value,]...) → object
		 * **Example:** Create a simple object.
		 *
		 *     r.object('id', 5, 'data', ['foo', 'bar']).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/object
		 */
		object([key, value]: Array<any>, ...more: Array<Array<any>>): RObject<any>;
		object(...keyAndValues: Array<any>): RObject<any>;

		/**
		 * Construct a geometry object of type Point. The point is specified by two floating point numbers, the longitude (−180 to 180) and the latitude (−90 to 90) of the point on a perfect sphere.
		 *
		 * r.point(longitude, latitude) → point
		 * **Example:** Define a point.
		 *
		 *     r.table('geo').insert({
		*         id: 1,
		*         name: 'San Francisco',
		*         location: r.point(-122.423246,37.779388)
		*     }).run(conn, callback);
		 *
		 * http://rethinkdb.com/api/javascript/point
		 */
		point(longitude: r.numberLike, latitude: r.numberLike): RPoint;

		/**
		 * Construct a geometry object of type Polygon. The Polygon can be specified in one of two ways:
		 *
		 * *   Three or more two-item arrays, specifying longitude and latitude numbers of the polygon's vertices;
		 * *   Three or more [Point](/api/javascript/point) objects specifying the polygon's vertices.
		 *
		 * r.polygon([lon1, lat1], [lon2, lat2], [lon3, lat3], ...) → polygonr.polygon(point1, point2, point3, ...) → polygon
		 * **Example:** Define a polygon.
		 *
		 *     r.table('geo').insert({
		*         id: 101,
		*         rectangle: r.polygon(
		*             [-122.423246,37.779388],
		*             [-122.423246,37.329898],
		*             [-121.886420,37.329898],
		*             [-121.886420,37.779388]
		*         )
		*     }).run(conn, callback);
		 *
		 * http://rethinkdb.com/api/javascript/polygon
		 */
		polygon(lon1Andlat1: Array<r.numberLike>, lon2Andlat2: Array<r.numberLike>, lon3Andlat3: Array<r.numberLike>, ...more: Array<Array<r.numberLike>>): RPolygon;
		polygon(point1: RPoint, point2: RPoint, ...points: Array<RPoint>): RPolygon;

		/**
		 * Generate a random number between given (or implied) bounds. `random` takes zero, one or two arguments.
		 *
		 * r.random() → numberr.random(number[, number], {float: true}) → numberr.random(integer[, integer]) → integer
		 * **Example:** Generate a random number in the range `[0,1)`
		 *
		 *     r.random().run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/random
		 */
		random(): RNumber;
		random(min: r.numberLike, max: r.numberLike, options?: { float?}): RNumber;
		random(number: r.numberLike, options?: { float?}): RNumber;

		/**
		 * Generate a stream of sequential integers in a specified range.
		 *
		 * r.range() → streamr.range([startValue, ]endValue) → stream
		 * **Example:** Return a four-element range of `[0, 1, 2, 3]`.
		 *
		 *     > r.range(4).run(conn, callback)
		 *
		 *     [0, 1, 2, 3]
		 *
		 * http://rethinkdb.com/api/javascript/range
		 */
		range(): RStream<Array<r.numberLike>>;
		range(startValue: r.numberLike, endValue: r.numberLike): RStream<Array<r.numberLike>>;
		range(endValue: r.numberLike): RStream<Array<r.numberLike>>;

		/**
		 * Rounds the given value to the nearest whole integer.
		 *
		 * r.round(number) → numbernumber.round() → number
		 * **Example:** Round 12.345 to the nearest integer.
		 *
		 *     > r.round(12.345).run(conn, callback);
		 *
		 *     12.0
		 *
		 * http://rethinkdb.com/api/javascript/round
		 */
		round(number: r.numberLike): RNumber;

		/**
		 * Returns the currently visited document.
		 *
		 * r.row → value // TODO: BUG in the docs?
		 * **Example:** Get all users whose age is greater than 5.
		 *
		 *     r.table('users').filter(r.row('age').gt(5)).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/row
		 */
		row(name: r.stringLike): RValue<any>;
		row<T extends RNumber>(name: r.stringLike): RNumber;
		row<T extends RString>(name: r.stringLike): RString;
		row<T extends RArray<any>>(name: r.stringLike): T;
		row<T extends RBool>(name: r.stringLike): RBool;
		row<T extends RTime>(name: r.stringLike): RTime;
		row<T extends RLine>(name: r.stringLike): RLine;
		row<T extends RPoint>(name: r.stringLike): RPoint;
		row<T extends RGeometry<any>>(name: r.stringLike): T;
		row<T extends RObject<any>>(name: r.stringLike): T;
		row<T extends number>(name: r.stringLike): RNumber;
		row<T extends string>(name: r.stringLike): RString;
		row<T extends boolean>(name: r.stringLike): RBool;
		row<T extends Date>(name: r.stringLike): RTime;
		row<T extends Object>(name: r.stringLike): RObject<T>;
		row<T extends Array<ArrOfT>, ArrOfT>(name: r.stringLike): RArray<ArrOfT>;
		// row<T extends Array<T>>(name:r.stringLike): RArray<T>;

		/**
		 * Create a time object for a specific time.
		 *
		 * A few restrictions exist on the arguments:
		 *
		 * *   `year` is an integer between 1400 and 9,999.
		 * *   `month` is an integer between 1 and 12.
		 * *   `day` is an integer between 1 and 31.
		 * *   `hour` is an integer.
		 * *   `minutes` is an integer.
		 * *   `seconds` is a double. Its value will be rounded to three decimal places (millisecond-precision).
		 * *   `timezone` can be `'Z'` (for UTC) or a string with the format `±[hh]:[mm]`.
		 *
		 * r.time(year, month, day[, hour, minute, second], timezone)→ time
		 * **Example:** Update the birthdate of the user "John" to November 3rd, 1986 UTC.
		 *
		 *     r.table("user").get("John").update({birthdate: r.time(1986, 11, 3, 'Z')})
		 *         .run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/time
		 */
		time(year: r.numberLike, month: r.numberLike, day: r.numberLike, hour: r.numberLike, minute: r.numberLike, second: r.numberLike, timezone?: r.stringLike): RTime;
		time(year: r.numberLike, month: r.numberLike, day: r.numberLike, timezone?: r.stringLike): RTime;

		/**
		 * Return a UUID (universally unique identifier), a string that can be used as a unique ID.
		 *
		 * r.uuid() → string
		 * **Example:** Generate a UUID.
		 *
		 *     > r.uuid().run(conn, callback)
		 *     // result returned to callback
		 *     "27961a0e-f4e8-4eb3-bf95-c5203e1d87b9"
		 *
		 * http://rethinkdb.com/api/javascript/uuid
		 */
		uuid(deterministicStringToHash?: r.stringLike): RString;

		/**
		 * Wait for a table or all the tables in a database to be ready. A table may be temporarily unavailable after creation, rebalancing or reconfiguring. The `wait` command blocks until the given table (or database) is fully up to date.
		 *
		 * table.wait([{waitFor: 'ready_for_writes', timeout: <sec>}]) → object
		 * database.wait([{waitFor: 'ready_for_writes', timeout: <sec>}]) → object
		 * r.wait([{waitFor: 'ready_for_writes', timeout: <sec>}]) → object</sec></sec></sec>
		 * **Example:** Wait for a table to be ready.
		 *
		 *     > r.table('superheroes').wait().run(conn, callback);
		 *
		 * http://rethinkdb.com/api/javascript/wait
		 */
		wait(options?: { waitFor?: string, timeout?: number }): RObject<any>;

		/**
		 * Compute the logical "and" of one or more values.
		 *
		 * bool.and([bool, bool, ...]) → boolr.and([bool, bool, ...]) → bool
		 * **Example:** Return whether both `a` and `b` evaluate to true.
		 *
		 *     var a = true, b = false;
		 *     r.expr(a).and(b).run(conn, callback);
		 *     // result passed to callback
		 *     false
		 *
		 * http://rethinkdb.com/api/javascript/and
		 */
		and(...bools: Array<r.boolLike>): RBool;

		/**
		 * Compute the logical inverse (not) of an expression.
		 *
		 * `not` can be called either via method chaining, immediately after an expression that evaluates as a boolean value, or by passing the expression as a parameter to `not`.
		 *
		 * bool.not() → boolnot(bool) → bool
		 * **Example:** Not true is false.
		 *
		 *     r(true).not().run(conn, callback)
		 *     r.not(true).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/not
		 */
		not(bool: r.boolLike): RBool;

		/**
		 * Compute the logical "or" of one or more values.
		 *
		 * bool.or([bool, bool, ...]) → boolr.or([bool, bool, ...]) → bool
		 * **Example:** Return whether either `a` or `b` evaluate to true.
		 *
		 *     var a = true, b = false;
		 *     r.expr(a).or(b).run(conn, callback);
		 *     // result passed to callback
		 *     true
		 *
		 * http://rethinkdb.com/api/javascript/or
		 */
		or(...bools: Array<r.boolLike>): RBool;

		// TODO:
		minval: any;
		maxval: any;

		// TODO: r.map() and some others
	}

	// helpers:
	export interface RCursor<RemoteT> extends NodeJS.EventEmitter {
		/**
		 * Close a cursor. Closing a cursor cancels the corresponding query and frees the memory associated with the open request.
		 *
		 * cursor.close()
		 * **Example:** Close a cursor.
		 *
		 *     cursor.close()
		 *
		 * http://rethinkdb.com/api/javascript/close-cursor
		 */
		close(): void;

		/**
		 * Lazily iterate over the result set one element at a time.
		 *
		 * cursor.each(callback[, onFinishedCallback])array.each(callback[, onFinishedCallback])feed.each(callback)
		 * **Example:** Let's process all the elements!
		 *
		 *     cursor.each(function(err, row) {
		*         if (err) throw err;
		*         processRow(row);
		*     });
		 *
		 * http://rethinkdb.com/api/javascript/each
		 */
		each(callback: CallbackFunction<RemoteT>, onFinishedCallback?: CallbackFunction<RemoteT>): void;

		/**
		 * Lazily iterate over a result set one element at a time in an identical fashion to [each](/api/javascript/each/), returning a Promise that will be resolved once all rows are returned.
		 *
		 * cursor.eachAsync(function) → promisearray.eachAsync(function) → promisefeed.eachAsync(function) → promise
		 * **Example:** Process all the elements in a stream.
		 *
		 *     cursor.eachAsync(function(row) {
		*         // if a Promise is returned, it will be processed before the cursor
		*         // continues iteration.
		*         return asyncRowHandler(row);
		*     }).then(function () {
		*         console.log("done processing");
		*     });
		 *
		 * http://rethinkdb.com/api/javascript/each_async
		 */
		eachAsync(process_function: (element: RemoteT) => any): Promise<void>;

		/**
		 * Get the next element in the cursor.
		 *
		 * cursor.next(callback)
		 * array.next(callback)
		 * cursor.next() → promise
		 * array.next() → promise
		 * **Example:** Retrieve the next element.
		 *
		 *     cursor.next(function(err, row) {
		 *         if (err) throw err;
		 *         processRow(row);
		 *     });
		 *
		 * http://rethinkdb.com/api/javascript/next
		 */
		next(callback: CallbackFunction<RemoteT>): void;
		next(): Promise<RemoteT>;

		// TODO: check if toArray correctly outputs RArray
		/**
		 * Retrieve all results and pass them as an array to the given callback.
		 *
		 * cursor.toArray(callback)array.toArray(callback)
		 * cursor.toArray() → promisearray.toArray() → promise
		 * **Example:** For small result sets it may be more convenient to process them at once as an array.
		 *
		 *     cursor.toArray(function(err, results) {
		 *         if (err) throw err;
		 *         processResults(results);
		 *     });
		 *
		 * http://rethinkdb.com/api/javascript/to_array
		 */
		toArray(callback: CallbackFunction<Array<RemoteT>>): void;
		toArray(): Promise<Array<RemoteT>>;
	}

	export interface RConnection {

		/**
		 * Close an open connection.
		 *
		 * If no callback is provided, a promise will be returned.
		 *
		 * conn.close([{noreplyWait: true}, ]callback)
		 conn.close([{noreplyWait: true}]) → promise
		 * **Example:** Close an open connection, waiting for noreply writes to finish.
		 *
		 *     conn.close(function(err) { if (err) throw err; })
		 *
		 * http://rethinkdb.com/api/javascript/close
		 */
		close(options: { noreplyWait?}, callback: CallbackFunction<void>): void;
		close(callback: CallbackFunction<void>): void;
		close(options?: { noreplyWait?}): Promise<void>;
		close(): Promise<void>;

		/**
		 * Close and reopen a connection.
		 *
		 * If no callback is provided, a promise will be returned.
		 *
		 * conn.reconnect([{noreplyWait: true}, ]callback)
		 conn.reconnect([{noreplyWait: true}]) → promise
		 * **Example:** Cancel outstanding requests/queries that are no longer needed.
		 *
		 *     conn.reconnect({noreplyWait: false}, function(error, connection) { ... })
		 *
		 * http://rethinkdb.com/api/javascript/reconnect
		 */
		reconnect(options: { noreplyWait?}, callback: CallbackFunction<RConnection>): void;
		reconnect(callback: CallbackFunction<RConnection>): void;
		reconnect(options?: { noreplyWait?}): Promise<RConnection>;

		/**
		 * noreplyWait ensures that previous queries with the noreply flag have been processed by the server.
		 * Note that this guarantee only applies to queries run on the given connection.
		 */
		noreplyWait(callback: CallbackFunction<void>): void;
		noreplyWait(): Promise<void>;

		/**
		 * Change the default database on this connection.
		 *
		 * conn.use(dbName)
		 * **Example:** Change the default database so that we don't need to specify the database when referencing a table.
		 *
		 *     conn.use('marvel')
		 *     r.table('heroes').run(conn, ...) // refers to r.db('marvel').table('heroes')
		 *
		 * http://rethinkdb.com/api/javascript/use
		 */
		use(dbName: string): void;

		/**
		 * Return the server name and server UUID being used by a connection.
		 */
		server(callback: CallbackFunction<ServerDefinition>);
		server(): Promise<ServerDefinition>
	}

	export interface RConfigurable extends RAny {
		/**
		 * Query (read and/or update) the configurations for individual tables or databases.
		 *
		 * table.config() → selection<object>
		 * database.config() → selection<object>
		 * **Example:** Get the configuration for the `users` table.
		 *
		 *     > r.table('users').config().run(conn, callback);
		 *
		 * http://rethinkdb.com/api/javascript/config
		 */
		config(): RSingleSelection<TableConfig>;

		/**
		 * Rebalances the shards of a table. When called on a database, all the tables in that database will be rebalanced.
		 *
		 * table.rebalance() → object
		 * database.rebalance() → object
		 * **Example:** Rebalance a table.
		 *
		 *     > r.table('superheroes').rebalance().run(conn, callback);
		 *
		 * http://rethinkdb.com/api/javascript/rebalance
		 */
		rebalance(): RObject<any>;

		/**
		 * Reconfigure a table's sharding and replication.
		 *
		 * table.reconfigure({shards: <s>, replicas: <r>[, primaryReplicaTag: <t>, dryRun: false}]) → object
		 * database.reconfigure({shards: <s>, replicas: <r>[, primaryReplicaTag: <t>, dryRun: false}]) → object
		 * **Example:** Reconfigure a table.
		 *
		 *     > r.table('superheroes').reconfigure({shards: 2, replicas: 1}).run(conn, callback);
		 *
		 * http://rethinkdb.com/api/javascript/reconfigure
		 */
		reconfigure(options: { shards: any, replicas: any, primaryReplicaTag?: any, dryRun?: boolean | RBool }): RObject<any>;

		/**
		 * Wait for a table or all the tables in a database to be ready. A table may be temporarily unavailable after creation, rebalancing or reconfiguring. The `wait` command blocks until the given table (or database) is fully up to date.
		 *
		 * table.wait([{waitFor: 'ready_for_writes', timeout: <sec>}]) → objectdatabase.wait([{waitFor: 'ready_for_writes', timeout: <sec>}]) → objectr.wait([{waitFor: 'ready_for_writes', timeout: <sec>}]) → object</sec></sec></sec>
		 * **Example:** Wait for a table to be ready.
		 *
		 *     > r.table('superheroes').wait().run(conn, callback);
		 *
		 * http://rethinkdb.com/api/javascript/wait
		 */
		wait(options?: { waitFor?: r.stringLike, timeout?: r.numberLike }): RObject<any>;
	}

	export interface RDb extends RConfigurable, RAny {
		/**
		 * Select all documents in a table. This command can be chained with other commands to do further processing on the data.
		 *
		 * db.table(name[, {readMode: 'single', identifierFormat: 'name'}]) → table
		 * **Example:** Return all documents in the table 'marvel' of the default database.
		 *
		 *     r.table('marvel').run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/table
		 */
		table<T>(name: r.stringLike, options?: { readMode?, identifierFormat?}): RTable<T>;

		/**
		 * Create a table. A RethinkDB table is a collection of JSON documents.
		 *
		 * db.tableCreate(tableName[, options]) → object
		 r.tableCreate(tableName[, options]) → object
		 * **Example:** Create a table named 'dc_universe' with the default settings.
		 *
		 *     r.db('heroes').tableCreate('dc_universe').run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/table_create
		 */
		tableCreate(tableName: r.stringLike, options?): RObject<any>;

		/**
		 * Drop a table. The table and all its data will be deleted.
		 *
		 * db.tableDrop(tableName) → object
		 * **Example:** Drop a table named 'dc_universe'.
		 *
		 *     r.db('test').tableDrop('dc_universe').run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/table_drop
		 */
		tableDrop(tableName: r.stringLike): RObject<DropResult>;

		/**
		 * List all table names in a database. The result is a list of strings.
		 *
		 * db.tableList() → array
		 * **Example:** List all tables of the 'test' database.
		 *
		 *     r.db('test').tableList().run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/table_list
		 */
		tableList(): RArray<string>;
	}

	interface RCoercable { // TODO: Make generic (so there's no need for casting arrays and objects)
		/**
		 * Convert a value of one type into another.
		 *
		 * sequence.coerceTo('array') → array
		 * sequence.coerceTo('object') → object
		 * value.coerceTo('string') → string
		 * array.coerceTo('object') → object
		 * object.coerceTo('array') → array
		 * binary.coerceTo('string') → string
		 * string.coerceTo('number') → number
		 * string.coerceTo('binary') → binary
		 * **Example:** Coerce a stream to an array.
		 *
		 *     r.table('posts').map(function (post) {
		 *         post.merge({ comments: r.table('comments').getAll(post('id'), {index: 'postId'}).coerceTo('array')});
		 *     }).run(conn, callback)
		 *
		 * http://rethinkdb.com/api/javascript/coerce_to
		 */
		//coerceTo: RGetField;
		coerceTo<ArrayOfT>(type: 'array'): RArray<ArrayOfT>;
		// coerceTo(type: 'array'): RArray<this>;
		coerceTo<T>(type: 'object'): RObject<T>;
		coerceTo(type: 'string'): RString;
		coerceTo(type: 'number'): RNumber;
		coerceTo(type: 'binary'): RBinary;
		coerceTo(type: string): RAny;
	}

	interface CallbackFunction<U> {
		(err: Error, result: U): void;
	}

	interface JoinFunction<U> {
		(left: RObject<any>, right: RObject<any>): U;
	}
	interface InsertOptions {
		returnChanges: boolean | 'always';
		conflict: "error" | "replace" | "update";
		// { durability?: string, returnChanges?: string, conflict?: string }
		upsert: boolean; // true
		durability: 'hard' | 'soft'; // 'soft'
		// return_vals: boolean; // false
	}

	interface UpdateOptions {
		non_atomic: boolean;
		durability: string; // 'soft'
		return_vals: boolean; // false
	}

	interface WriteResult {
		/**
		 * the number of documents successfully inserted
		 */
		inserted: number;
		/**
		 * the number of documents updated when conflict is set to "replace" or "update"
		 */
		replaced?: number;
		/**
		 * the number of documents whose fields are identical to existing documents with the same primary key when conflict is set to "replace" or "update"
		 */
		unchanged?: number;
		/**
		 * the number of errors encountered while performing the insert
		 */
		errors: number;
		/**
		 * 0 for an insert operation
		 */
		deleted: number;
		/**
		 * 0 for an insert operation
		 */
		skipped: number;
		/**
		 *  a list of generated primary keys for inserted documents whose primary keys were not specified (capped to 100,000).
		 */
		first_error?: string;
		warnings?: string[];
		/**
		 * a list of generated primary keys for inserted documents whose primary keys were not specified (capped to 100,000).
		 */
		generated_keys?: string[]; // only for insert
		/**
		 * if returnChanges is set to true, this will be an array of objects, one for each objected affected by the insert operation. Each object will have two keys: {new_val: <new value>, old_val: null}.
		 */
		changes?: Array<{ new_val: Object, old_val: Object }>;
		// TODO: make generic
	}

	interface TableConfig {
		id: string;
		name: string;
		db: string;
		primary_key: string;
		shards: Array<Shard>;
		indexes: Array<string>;
		write_acks: string;
		durability: string;
	}

	interface Shard {
		primary_replica: string;
		replicas: Array<string>;
		nonvoting_replicas: Array<string>;
	}

	interface GroupResult<T> {
		group: T;
		reduction: Array<Object>;
	}

	interface JoinResult<LeftT, RightT> {
		left: LeftT;
		right: RightT;
	}

	interface ChangesResult<RemoteT> {
		old_val?: RemoteT,
		new_val?: RemoteT,
		state?: string,
	}

	interface CreateResult {
		created: number;
	}

	interface DropResult {
		dropped: number;
	}

	interface WriteOptions {
		durability?: string;
		returnChanges?: boolean | RBool;
		nonAtomic?: boolean | RBool;
	}

	interface ServerDefinition {
		id: string;
		name: string;
	}

	export interface RConnectionOptions {
		port?: number;
		host?: string;
		readMode?, timeFormat?, profile?, durability?, groupFormat?, noreply?, db?, arrayLimit?, binaryFormat?, minBatchRows?, maxBatchRows?, maxBatchBytes?, maxBatchSeconds?, firstBatchScaledownFactor?
	}
	export interface RRunable<T> {
		run(connection: RConnection, cb: CallbackFunction<T>): void;
		run(connection: RConnection, options: RConnectionOptions, cb: CallbackFunction<T>): void;
		run(connection: RConnection, options?: RConnectionOptions): Promise<T>;
	}
}

declare module 'rethinkdb' {
	var r: rethinkdb.R;
	export = r;
}
