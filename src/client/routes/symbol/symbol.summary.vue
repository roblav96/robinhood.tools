<!--  -->
<script lang="ts" src="./symbol.summary.ts"></script>

<style>
/**/

</style>

<template>
	<section class="section is-medium mb-8">
		<div class="container">



			<div class="columns is-variable is-4">
				<div class="column " v-for="schema in schemas" :key="schema.name">
					<table class="table is-middle is-hoverable is-fullwidth  is-borderless card is-light">
						<thead>
							<tr>
								<th class="is-size-5 whitespace-no-wrap">{{schema.name}}</th>
								<th class="has-text-right py-2">
									<b-icon size="is-32x32" :icon="schema.icon"></b-icon>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="def in schema.defs" :key="def.key">
								<td class="whitespace-no-wrap">{{!def.title?vstcase(def.key):def.title}}</td>
								<td class="has-text-right font-medium">
									{{vvalue(def.key)}}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div class="columns is-variable is-4">
				<div class="column">
					<table class="table is-middle is-hoverable is-fullwidth card is-light">
						<thead>
							<tr>
								<th class="is-size-5 whitespace-no-wrap">Synopsis</th>
								<th class="has-text-right py-2">
									<b-icon size="is-32x32" icon="book-open-variant"></b-icon>
								</th>
							</tr>
							<tr>
								<th class="font-normal border-0 content" colspan="2">
									<p>{{all.quote.description}}</p>
								</th>
							</tr>
						</thead>
					</table>
				</div>
			</div>

			<div class="columns is-multiline is-mobile is-variable is-4">
				<div class="column" v-for="state in states" :key="state.name">
					<table class="table is-middle is-hoverable is-fullwidth is-nowrap is-borderless card is-light">
						<thead>
							<tr>
								<th class="whitespace-no-wrap">{{state.name}}</th>
								<th class="py-1 has-text-right">
									<b-icon size="is-24x24" :icon="state.icon"></b-icon>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<b-tooltip :label="state.tip" position="is-right" size="is-small" animated>
									<td>{{vstcase(state.calc)}}</td>
								</b-tooltip>
								<td class="has-text-right font-medium font-mono">
									{{nformat(all.quote[state.calc])}}
								</td>
							</tr>
							<tr>
								<td>{{vstcase(`${state.key}Price`)}}</td>
								<td class="has-text-right font-medium font-mono">
									{{nformat(all.quote[vcamel(`${state.key}Price`)])}}
								</td>
							</tr>
							<tr>
								<td>{{vstcase(`${state.key}Change`)}}</td>
								<td class="has-text-right font-medium font-mono" v-bull-bear="all.quote[vcamel(`${state.key}Change`)]">
									{{nformat(all.quote[vcamel(`${state.key}Change`)],{nozeros:true,plusminus:true})}}
								</td>
							</tr>
							<tr>
								<td>{{vstcase(`${state.key}Percent`)}}</td>
								<td class="has-text-right font-medium font-mono" v-bull-bear="all.quote[vcamel(`${state.key}Percent`)]">
									{{nformat(all.quote[vcamel(`${state.key}Percent`)],{nozeros:true,plusminus:true,percent:true})}}
								</td>
							</tr>
							<tr>
								<td>Updated</td>
								<td class="has-text-right font-medium">
									<v-timestamp :value="all.quote[vcamel(`${state.key}Timestamp`)]"></v-timestamp>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>



		</div>
	</section>
</template>
