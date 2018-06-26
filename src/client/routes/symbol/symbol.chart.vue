<!--  -->
<script lang="ts" src="./symbol.chart.ts"></script>

<style>
/**/

#symbol_chart .dropdown-content {
	max-height: calc(80vh - 150px);
}

#symbol_chart .taginput .control.has-icons-left .input {
	padding-left: 2.5rem;
}

#symbol_chart .taginput .input {
	padding-left: 0px;
}

</style>

<template>
	<div id="symbol_chart" class="flex-col-full">
		<v-loading :active="busy" parent :is-full-page="false"></v-loading>
		<section class="section py-0 pt-1">
			<div class="columns is-mobile my-0 items-center">

				<div class="column is-narrow">
					<b-dropdown :disabled="busy" hoverable>
						<b-field slot="trigger">
							<p class="control">
								<button class="button" @click="settings.time=!settings.time">
									<b-icon :icon="settings.time?'av-timer':'reorder-vertical'"></b-icon>
								</button>
							</p>
							<p class="control">
								<button class="button" @click="settings.ohlc=!settings.ohlc">
									<b-icon :icon="settings.ohlc?'poll':'chart-line-variant'"></b-icon>
								</button>
							</p>
						</b-field>
						<b-dropdown-item custom class="text-initial pt-0">
							<b-field label="X Axis Scale">
								<b-field>
									<b-radio v-model="settings.time" :native-value="false" :disabled="busy">Linear</b-radio>
									<b-radio v-model="settings.time" :native-value="true" :disabled="busy">Time</b-radio>
								</b-field>
							</b-field>
							<b-field label="Price Chart">
								<b-field>
									<b-radio v-model="settings.ohlc" :native-value="true" :disabled="busy">OHLC</b-radio>
									<b-radio v-model="settings.ohlc" :native-value="false" :disabled="busy">Line</b-radio>
								</b-field>
							</b-field>
						</b-dropdown-item>
					</b-dropdown>
				</div>

				<div class="column is-narrow">
					<b-field>
						<b-radio-button type="is-primary" :disabled="busy" v-model="settings.range" v-for="v in ranges" :key="v"
						    :native-value="v">
							<span>{{vcapitalize(v)}}</span>
						</b-radio-button>
					</b-field>
				</div>

				<div class="column is-narrow">
					<b-field>
						<span class="tag is-medium is-success">
							<span>SMA 10</span>
							<button class="delete is-small ml-2 -mr-1"></button>
						</span>
					</b-field>
				</div>

				<div class="column">
					<b-field>
						<p class="control">
							<button class="button h-full" :disabled="busy" @click="()=>$refs.symbol_vechart.resetzoom()">
								<b-icon icon="tune-vertical"></b-icon>
							</button>
						</p>
						<p class="control is-expanded">
							<b-taginput v-model="tags" :data="datasets" autocomplete open-on-focus clear-on-select keep-first spellcheck="off"
							    field="name" placeholder="Datasets..." @typing="typing" @click="ontagclick">
								<template slot-scope="props">
									<div @click="editds">
										{{props.option}}
									</div>
								</template>
								<template slot="empty">No datasets found...</template>
							</b-taginput>
						</p>
					</b-field>
				</div>

				<div class="column is-narrow">
					<b-field>
						<p class="control">
							<button class="button" :disabled="busy" @click="()=>$refs.symbol_vechart.resetzoom()">
								<b-icon icon="crop-landscape"></b-icon>
							</button>
						</p>
						<p class="control">
							<b-tooltip :active.sync="brushing" multilined label="Click and drag chart to crop zoom" size="is-small"
							    animated>
								<button class="button" :disabled="busy" :class="{'is-primary':brushing}" @click="brushing=!brushing">
									<b-icon icon="crop"></b-icon>
								</button>
							</b-tooltip>
						</p>
						<p class="control">
							<button class="button" :disabled="busy" @click="()=>$refs.symbol_vechart.latestzoom()">
								<b-icon icon="page-last"></b-icon>
							</button>
						</p>
					</b-field>
				</div>

			</div>
		</section>

		<!-- <section class="flex-col-full overflow-y-auto"> -->
		<v-symbol-echart class="flex-col-full mx-1" ref="symbol_vechart"></v-symbol-echart>
		<!-- </section> -->



		<!-- <div class="column"> -->
		<!-- <div class="column">
					<b-dropdown v-model="range" hoverable position="is-top-right">
						<button class="button is-large is-primary" type="button" slot="trigger">
							<b-icon icon="calendar-range"></b-icon>
							<span>{{vstcase(range)}}</span>
						</button>
						<b-dropdown-item v-for="v in ranges" :value="v">
							<span>{{vstcase(v)}}</span>
						</b-dropdown-item>
					</b-dropdown>
				</div> -->
		<!-- </div> -->

	</div>
</template>
