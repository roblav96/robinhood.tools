<!--  -->
<script lang="ts" src="./symbol.summary.ts"></script>

<style>
/**/
</style>

<template>
	<section class="section">
		<div class="columns is-multiline">
			<div class="column is-6 is-4-widescreen" v-for="schema in schemas" :key="schema.name">
				<article class="message">
					<div class="message-header py-0 justify-start">
						<b-icon class="mr-2" size="is-24x24" :icon="schema.icon"></b-icon>
						<p class="py-3 text-lg font-semibold">{{ schema.name }}</p>
					</div>
					<div class="message-body p-1 pt-0 has-background-grey-lightest">
						<table class="table is-middle is-hoverable is-fullwidth is-borderless">
							<tbody>
								<tr v-for="def in schema.defs" :key="def.key">
									<td class="font-semibold whitespace-no-wrap">
										{{ !def.title ? vstcase(def.key) : def.title }}
									</td>
									<td class="has-text-right">
										{{ vvalue(def.key) }}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</article>
			</div>
			<div class="column">
				<article class="message">
					<div class="message-header py-0 justify-start">
						<b-icon class="mr-2" size="is-24x24" icon="book-open-variant"></b-icon>
						<p class="py-3 text-lg font-semibold">Description</p>
						<div class="flex-grow"></div>
						<a
							class="button is-white is-small is-outlined font-medium"
							:href="all.quote.website"
							target="_blank"
						>
							<b-icon size="is-16x16" icon="web"></b-icon>
							<span>{{ website }}</span>
						</a>
					</div>
					<div class="message-body p-1 pt-0 has-background-grey-lightest">
						<p class="content has-background-white px-3 py-2">
							{{ all.quote.description }}
						</p>
					</div>
				</article>
			</div>
		</div>

		<!-- <div class="columns">
				<div class="column">
					<article class="message">
						<div class="message-header py-0 justify-start">
							<b-icon class="mr-2" size="is-24x24" icon="book-open-variant"></b-icon>
							<p class="py-3 text-lg font-semibold">Description</p>
							<div class="flex-grow"></div>
							<a class="button is-white is-small is-outlined font-medium" :href="all.quote.website" target="_blank">
								<b-icon size="is-16x16" icon="web"></b-icon>
								<span>{{website}}</span>
							</a>
						</div>
						<div class="message-body p-1 pt-0 has-background-grey-lightest">
							<p class="has-background-white px-3 py-2">
								{{all.quote.description}}
							</p>
						</div>
					</article>
				</div>
			</div> -->

		<div class="columns is-multiline is-mobile">
			<div class="column" v-for="state in states" :key="state.name">
				<table
					class="table is-middle is-hoverable is-fullwidth is-nowrap is-borderless card is-border"
				>
					<thead>
						<tr>
							<th class="whitespace-no-wrap">{{ state.name }}</th>
							<th class="py-1 has-text-right">
								<b-icon size="is-24x24" :icon="state.icon"></b-icon>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<b-tooltip
								:label="state.tip"
								position="is-right"
								size="is-small"
								animated
							>
								<td class="has-text">{{ vstcase(state.calc) }}</td>
							</b-tooltip>
							<td class="has-text-right">
								{{ vnumber(all.quote[state.calc]) }}
							</td>
						</tr>
						<tr>
							<td class="has-text">{{ vstcase(`${state.key}Price`) }}</td>
							<td class="has-text-right">
								{{ vnumber(all.quote[vcamel(`${state.key}Price`)]) }}
							</td>
						</tr>
						<tr>
							<td class="has-text">{{ vstcase(`${state.key}Change`) }}</td>
							<td
								class="has-text-right"
								v-bull-bear="all.quote[vcamel(`${state.key}Change`)]"
							>
								{{
									vnumber(all.quote[vcamel(`${state.key}Change`)], {
										nozeros: true,
										plusminus: true,
									})
								}}
							</td>
						</tr>
						<tr>
							<td class="has-text">{{ vstcase(`${state.key}Percent`) }}</td>
							<td
								class="has-text-right"
								v-bull-bear="all.quote[vcamel(`${state.key}Percent`)]"
							>
								{{
									vnumber(all.quote[vcamel(`${state.key}Percent`)], {
										nozeros: true,
										plusminus: true,
										percent: true,
									})
								}}
							</td>
						</tr>
						<tr>
							<td class="has-text">Updated</td>
							<td class="has-text-right">
								<v-timestamp
									:value="all.quote[vcamel(`${state.key}Timestamp`)]"
								></v-timestamp>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</section>
</template>
